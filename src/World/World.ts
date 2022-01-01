import { v4 as uuid } from 'uuid';

import { 
  ComponentContainer, ComponentCatalog,
  Listener, Action, ArrayChunk,
  Entity, Vector, Chaos, ClientWorld, Scope, Layer, ByteLayer, NestedMap, NestedSet, NestedChanges,
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
      for (let x = 0; x <= size.x; x++) {
        for (let y = 0; y <= size.y; y++) {
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

  addEntity(entity: Entity): NestedChanges | false {
    if (!this.entities.has(entity.id) && this.isInBounds(entity.position)) {
      // Add the entity to full list
      this.entities.set(entity.id, entity);
      // Add it to entities by chunk
      const chunkIndex = entity.position.toChunkSpace().getIndexString();
      if(!this.entitiesByChunk.has(chunkIndex)) {
        this.entitiesByChunk.set(chunkIndex, new Map<string, Entity>());        
      }
      this.entitiesByChunk.get(chunkIndex)?.set(entity.id, entity);
      // Add visible chunks to the entity and attach it
      const viewDistance = entity.active ? Chaos.viewDistance : Chaos.inactiveViewDistance;
      const changes = entity.visibleChunks.addSet(this.getChunksInView(entity.position, viewDistance));
      this.visibleChunks.addChild(entity.visibleChunks, changes);
      return changes;
    }
    return false;
  }

  removeEntity(e: Entity): boolean {
    if(e.id && this.entities.has(e.id)) {
      this.entities.delete(e.id);
      const chunk = e.position.toChunkSpace().getIndexString();
      this.entitiesByChunk.get(chunk)?.delete(e.id); 
      return true;
    }
    return false;
  }

  moveEntity(entity: Entity, from: Vector, to: Vector) {
    if(entity.id && this.entities.has(entity.id)) {
      if(from.differentChunkFrom(to)) {
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
      }
    }
  }

  addTemporaryViewer(position: Vector, active: boolean): NestedSet {
    const viewDistance = active ? Chaos.viewDistance : Chaos.inactiveViewDistance;
    const chunksInView = this.getChunksInView(position, viewDistance);
    const temporaryViewer = new NestedSet(uuid(), 'entity', chunksInView);
    this.visibleChunks.addChild(temporaryViewer);
    return temporaryViewer;
  }

  // Remove a viewer, probably a surrogate/temporary one
  removeViewer(id: string) {
    this.visibleChunks.removeChild(id);
  }

  getChunksInView(center: Vector, distance: number): Set<string> {
    const chunks = new Set<string>();
    let topLeft = center.add(new Vector(-distance, -distance));
    let bottomRight = center.add(new Vector(distance, distance));
    topLeft = topLeft.clamp();
    if(this.size) {
      bottomRight = bottomRight.clamp(this.size.toBaseZero());
    }
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        chunks.add(new Vector(x, y).getIndexString());
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
    return  x > 0 && y > 0
            && x < this.size.x 
            && y < this.size.y;
  }

  abstract serialize(): string;

  serializeForClient(): World.SerializedForClient {
    return {
      id: this.id,
      name: this.name,
      width: this.size.x,
      height: this.size.y
    }
  }

  getFullChunkID(x: number, y: number): string {
    return `${this.id}${new Vector(x, y).getIndexString}`;
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
