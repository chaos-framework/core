import { v4 as uuid } from 'uuid';

import { 
  ComponentContainer, ComponentCatalog,
  Listener, Action, ArrayChunk,
  Entity, Vector, Chaos, ClientWorld, WorldScope, Scope, Layer, Chunk, ByteLayer,
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
  width?: number;
  height?: number;

  streaming: boolean = false; // whether or not to load/unload chunks from memory
  ephemeral: boolean = true;  // should be forgotten + all non-active entities deleted when unloaded

  scope: WorldScope; // which parts of the world are seen by who

  constructor({ id = uuid(), name = 'Unnamed World', width, height, streaming = false, baseLayer = new ByteLayer(0), additionalLayers }: World.ConstructorParams) {
    this.id = id;
    this.name = name;
    this.width = width;
    this.height = height;
    this.streaming = streaming;
    this.scope = new WorldScope(width, height);

    this.baseLayer = baseLayer;
    this.layers = additionalLayers || new Map<string, Layer<any>>();
    this.layers.set('base', this.baseLayer);
    // TODO check for width and height and force streaming if undefined or the world is too large
    // TODO if not streaming, should this super constructor handle creating chunks with default values?

    // Initialize the relevant layers with default values
    if (!streaming && width && height) {
      const chunkWidth = getChunkSpaceCoordinates(width);
      const chunkHeight = getChunkSpaceCoordinates(height);
      for (let x = 0; x <= chunkWidth; x++) {
        for (let y = 0; y <= chunkHeight; y++) {
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

  addEntity(entity: Entity, preloaded = false): boolean {
    if(!this.entities.has(entity.id)) {
      // Load the location if needed
      if(!preloaded) {
        this.addView(entity, entity.position);
      }
      // Add the entity to full list
      this.entities.set(entity.id, entity);
      const chunkIndex = entity.position.toChunkSpace().getIndexString();
      if(!this.entitiesByChunk.has(chunkIndex)) {
        this.entitiesByChunk.set(chunkIndex, new Map<string, Entity>());        
      }
      this.entitiesByChunk.get(chunkIndex)?.set(entity.id, entity);
      return true;
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

  addView(e: Entity, to: Vector, from?: Vector) {
    if(this.streaming) {
      const { id, active } = e;
      const change = this.scope.addViewer(id, active ? Chaos.viewDistance : Chaos.inactiveViewDistance, to, from);
      for(const s of change.added) {
        const v = Vector.fromIndexString(s);
        this.initializeChunk(v.x, v.y);
      }
    }
  }
  
  removeView(e: Entity, from: Vector, to?: Vector) {
    if(this.streaming) {
      const { id, active } = e;
      const change = this.scope.removeViewer(id, active ? Chaos.viewDistance : Chaos.inactiveViewDistance, from, to);
      for(const s of change.removed) {
        this.baseLayer.forgetChunk(s);
      }
    }
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

  createScope(): WorldScope {
    return new WorldScope(this.width, this.height);
  }

  abstract serialize(): string;

  serializeForClient(): World.SerializedForClient {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height
    }
  }
}

// tslint:disable-next-line: no-namespace
export namespace World {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    width?: number,
    height?: number,
    streaming?: boolean,
    baseLayer: Layer<ArrayChunk<number>>,
    additionalLayers?: Map<string, Layer<any>>
  }

  export interface Serialized {
    id: string;
    name: string;
    width?: number;
    height?: number;
  }

  export interface SerializedForClient {
    id: string;
    name: string;
    width?: number;
    height?: number;
  }

  export function deserializeAsClient(json: World.SerializedForClient): World {
    return new ClientWorld({ ...json, baseLayer: new ByteLayer(0) });
  }
}

export function getChunkSpaceCoordinates(i: number): number {
  return Math.floor(i / CHUNK_WIDTH);
}
