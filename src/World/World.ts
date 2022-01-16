import { chunk } from 'lodash';
import { v4 as uuid } from 'uuid';

import { 
  ComponentContainer, ComponentCatalog,
  Listener, Action, ArrayChunk,
  Entity, Vector, Chaos, ClientWorld, Scope, Layer, ByteLayer, NestedSetChanges, NestedSet, NestedChanges,
} from '../internal.js';

const CHUNK_WIDTH = 16;

export abstract class World implements ComponentContainer, Listener {
  readonly id: string;
  name: string;
  published = false;
  components: ComponentCatalog = new ComponentCatalog(this);
  baseLayer: Layer<ArrayChunk<number>>;
  layers: Map<string, Layer<any>>;

  entities = new Map<string, Entity>();
  entitiesByChunk: Map<string, Map<string, Entity>> = new Map<string, Map<string, Entity>>();

  fill: number = 0;
  size: Vector;

  streaming: boolean = false; // whether or not to load/unload chunks from memory
  ephemeral: boolean = true;  // should be forgotten + all non-active entities deleted when unloaded

  visibleChunks: NestedSet;

  constructor({ id = uuid(), name = 'Unnamed World', size = Vector.max(), streaming = false, baseLayer = new ByteLayer(0), additionalLayers }: World.ConstructorParams) {
    this.id = id;
    this.name = name;
    this.size = size
    this.streaming = streaming;

    this.baseLayer = baseLayer;
    this.layers = additionalLayers || new Map<string, Layer<any>>();
    this.layers.set('base', this.baseLayer);
    // TODO check for width and height and force streaming if undefined or the world is too large
    // TODO if not streaming, should this super constructor handle creating chunks with default values?

    this.visibleChunks = new NestedSet(this.id, 'world');

    // Initialize the relevant layers with default values
    if (!streaming) {
      for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
          this.initializeChunk(x, y);
        }
      }
    }
  }

  publish() {
    Chaos.addWorld(this);
    this.published = true;
  }

  isPublished(): boolean {
    return this.published;
  }

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
    if(scope === 'game') {
      return Chaos.reference;
    }
    return undefined;
  };

  addEntity(entity: Entity, changes?: NestedSetChanges): NestedSetChanges | boolean {
    if (!this.entities.has(entity.id) && this.isInBounds(entity.position)) {
      // Add the entity to full list
      this.entities.set(entity.id, entity);
      // Add it to entities by chunk
      const chunkIndex = entity.position.toChunkSpace().getIndexString();
      if(!this.entitiesByChunk.has(chunkIndex)) {
        this.entitiesByChunk.set(chunkIndex, new Map<string, Entity>());        
      }
      this.entitiesByChunk.get(chunkIndex)?.set(entity.id, entity);
      // Add visible chunks to the entity and attach it, but only if entity is active
      if (entity.active) {
        const viewDistance = entity.active ? Chaos.viewDistance : Chaos.inactiveViewDistance;
        const chunksInView = this.getChunksInView(entity.position, viewDistance);
        for (const position of chunksInView) {
          this.load(position);
        }
        entity.visibleChunks.addSet(new Set<string>(chunksInView.map(v => this.getFullChunkID(v.x, v.y))), undefined, changes);
        this.visibleChunks.addChild(entity.visibleChunks, changes);
      }
      return true;
    }
    return false;
  }

  removeEntity(entity: Entity, changes?: NestedSetChanges): boolean {
    if(entity.id && this.entities.has(entity.id)) {
      this.entities.delete(entity.id);
      const chunk = entity.position.toChunkSpace().getIndexString();
      this.entitiesByChunk.get(chunk)?.delete(entity.id);
      // Get changes from world and entity
      const removed = this.visibleChunks.removeChild(entity.id, changes);
      this.loadAndUnloadChanges(removed);
      entity.visibleChunks.clear(changes);
      return true;
    }
    return false;
  }

  moveEntity(entity: Entity, from: Vector, to: Vector, changes = new NestedSetChanges()): boolean {
    if(entity.id && this.entities.has(entity.id) && this.isInBounds(to)) {
      if(from.differentChunkFrom(to)) {
        // Track which chunk the entity is in
        const oldString = from.toChunkSpace().getIndexString();
        const old = this.entitiesByChunk.get(oldString);
        if(old) {
          old.delete(entity.id);
          if(old.size === 0) {
            this.entitiesByChunk.delete(oldString);
          }
        }
        const newString = to.toChunkSpace().getIndexString();
        if(!this.entitiesByChunk.has(newString)) {
          this.entitiesByChunk.set(newString, new Map<string, Entity>());
        }
        this.entitiesByChunk.get(newString)!.set(entity.id, entity);
        // Change which chunks are now visible to the entity, if active
        if (entity.active) {
          const viewDistance = entity.active ? Chaos.viewDistance : Chaos.inactiveViewDistance;
          // TODO SCOPE need to MASSIVELY optimize this vvv
          entity.visibleChunks.replace(new Set<string>(this.getChunksInView(to.toChunkSpace(), viewDistance).map(v => this.getFullChunkID(v.x, v.y))), undefined, changes);
        }
        this.loadAndUnloadChanges(changes);
      }
      return true;
    }
    return false;
  }

  addTemporaryViewer(position: Vector, active: boolean, changes = new NestedSetChanges): NestedSet {
    const viewDistance = active ? Chaos.viewDistance : Chaos.inactiveViewDistance;
    const chunksInView = this.getChunksInView(position, viewDistance);
    for (const chunk of chunksInView) {
      this.load(chunk);
    }
    const temporaryViewer = new NestedSet(uuid(), 'temporary');
    temporaryViewer.addSet(new Set<string>(chunksInView.map(v => this.getFullChunkID(v.x, v.y))), undefined, changes);
    this.visibleChunks.addChild(temporaryViewer, changes);
    return temporaryViewer;
  }

  // Remove a viewer, probably a surrogate/temporary one
  removeViewer(id: string, changes?: NestedSetChanges): NestedSetChanges {
    changes ??= new NestedSetChanges;
    this.loadAndUnloadChanges(this.visibleChunks.removeChild(id, changes));
    return changes;
  }

  load(coordinates: Vector) {
    const key = coordinates.getIndexString();
    if (!this.visibleChunks.has(key)) {
      this.initializeChunk(coordinates.x, coordinates.y); // TODO this should return entities [] also
    }
  }

  unload(coordinates: Vector) {
    // TODO SCOPE unload
  }

  loadAndUnloadChanges(changes: NestedSetChanges) {
    // Load new areas
    const toLoad = changes.added['world']?.[this.id];
    if(toLoad !== undefined) {
      for (const fullChunkID of toLoad) {
        const indexString = fullChunkID.split('_');
        const vector = Vector.fromIndexString(`${indexString[1]}_${indexString[2]}`); // lol god damnit
        this.load(vector);
      }
    }
    // Unload areas left
    const toUnload = changes.removed['world']?.[this.id];
    if (toUnload !== undefined) {
      for (const fullChunkID of toUnload) {
        const indexString = fullChunkID.split('_');
        const vector = Vector.fromIndexString(`${indexString[1]}_${indexString[2]}`); // lol god damnit
        this.unload(vector);
      }
    }
  }

  getChunksInView(center: Vector, distance: number): Vector[] { // TODO SCOPE unit test
    const chunks: Vector[] = [];
    let topLeft = center.add(new Vector(-distance, -distance));
    let bottomRight = center.add(new Vector(distance, distance));
    topLeft = topLeft.clamp();
    if(this.size) {
      bottomRight = bottomRight.clamp(this.size.toBaseZero());
    }
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        if(this.isChunkInBounds(new Vector(x, y))) {
          chunks.push(new Vector(x, y));
        }
      }
    }
    return chunks;
  }

  getEntitiesWithinRadius(origin: Vector, radius: number): Entity[] {
    const entities: Entity[] = []
    // TODO optimize to check for relevant chunks
    for(const [, entity] of this.entities) {
      if(entity && origin.withinRadius(entity.position, radius)) {
        entities.push(entity);
      }
    }
    return entities;
  }

  getEntitiesAtCoordinates(x: number, y: number): Entity[] {
    const vector = new Vector(x, y);
    const entities: Entity[] = [];
    const chunk = vector.toChunkSpace().getIndexString();
    const entitiesInChunk = this.entitiesByChunk.get(chunk);
    if(entitiesInChunk) {
      for(const [, entity] of entitiesInChunk) {
        if(entity && entity.position.equals(vector)) {
          entities.push(entity);
        }
      }
    }
    return entities;
  }

  // Get a tile by location. Optionally pass a layer to get just that single value.
  getTile(x: number, y: number, layer?: string): any {
    if (layer === undefined) {
      const results: any = {};
      for (const [name, layer] of this.layers) {
        results[name] = layer.get(x, y)
      }
      return results;
    } else {
      return this.layers.get(layer)?.get(x, y);
    }
  }

  getBaseTile(x: number, y: number): number | undefined {
    return this.baseLayer.get(x, y);
  }

  abstract initializeChunk(x: number, y: number): void;

  // TODO setTile and _setTile

  handle(phase: string, action: Action) {
    this.components.handle(phase, action);
  }

  isInBounds(position: Vector) {
    const { x, y } = position.toChunkSpace();
    return  x >= 0 && y >= 0
            && x < this.size.x 
            && y < this.size.y;
  }

  isChunkInBounds(position: Vector) {
    const { x, y } = position;
    return  x >= 0 && y >= 0
            && x < this.size.x 
            && y < this.size.y;
  }

  abstract serialize(): string;

  serializeChunk(position: Vector): { [key: string] : any };
  serializeChunk(x: number, y: number): { [key: string] : any }
  serializeChunk(position: any, other?: any): { [key: string] : any } {
    if (!(position instanceof Vector)) {
      position = new Vector(position, other);
    } 
    const o: { [key: string] : any } = {};
    for (const [id, layer] of this.layers) {
      o[id] = layer.getChunk(position.x, position.y)?.serialize();
    }
    return o;
  }

  serializeForClient(): World.SerializedForClient {
    return {
      id: this.id,
      name: this.name,
      width: this.size.x,
      height: this.size.y
    }
  }

  getFullChunkID(x: number, y: number): string {
    return `${this.id}_${new Vector(x, y).getIndexString()}`;
  }
}

// tslint:disable-next-line: no-namespace
export namespace World {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    size?: Vector,
    streaming?: boolean,
    baseLayer: Layer<ArrayChunk<number>>,
    additionalLayers?: Map<string, Layer<any>>
  }

  export interface Serialized {
    id: string;
    name: string;
    width: number;
    height: number;
  }

  export interface SerializedForClient {
    id: string;
    name: string;
    width: number;
    height: number;
  }

  export function deserializeAsClient(json: World.SerializedForClient): World {
    return new ClientWorld({ ...json, size: new Vector(json.width, json.height), baseLayer: new ByteLayer(0) });
  }
}

export function getChunkSpaceCoordinates(i: number): number {
  return Math.floor(i / CHUNK_WIDTH);
}
