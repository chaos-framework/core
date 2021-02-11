import { v4 as uuid } from 'uuid';

import { 
  Component, ComponentContainer,
  Listener, Modifier, Reacter, Action, ILayer, IChunk,
  ByteLayer,
  IEntity, Vector, Game, Scope, ClientWorld
} from '../internal';

const CHUNK_WIDTH = 16;

export abstract class World implements ComponentContainer, Listener {
  readonly id: string;
  name: string;
  components: Component[] = [];
  baseLayer: ByteLayer;
  // additionalLayers: Map<string, ILayer> = new Map<string, ILayer>();

  entities: Set<string> = new Set<string>();
  entitiesByChunk: Map<string, Set<string>> = new Map<string, Set<string>>();

  modifiers: Modifier[] = [];
  reacters: Reacter[] = [];

  width?: number;
  height?: number;

  streaming: boolean = false; // whether or not to load/unload chunks from memory
  ephemeral: boolean = true;  // should be forgotten + all contained entities deleted when unloaded

  scope: Scope; // which parts of the world are seen by who

  constructor({id = uuid(), name = 'Unnamed World', fill = 0, width, height, streaming = false, additionalLayers}: World.ConstructorParams) {
    this.id = id;
    this.name = name;
    this.width = width;
    this.height = height;
    this.streaming = streaming;
    this.scope = new Scope(width, height);

    this.baseLayer = new ByteLayer(fill);
    // TODO check for width and height and force streaming if undefined or the world is too large
    // TODO if not streaming, should this super constructor handle creating chunks with default values?

    // Initialize the relevant layers with default values
    if(!streaming && width && height) {
      const chunkWidth = getChunkSpaceCoordinates(width);
      const chunkHeight = getChunkSpaceCoordinates(height);
      for(let x = 0; x <= chunkWidth; x++) {
        for(let y = 0; y <= chunkHeight; y++) {
          this.initializeChunk(x, y);
        }
      }
    }
  }

  publish() {
    Game.getInstance().addWorld(this);
  }

  addEntity(e: IEntity, preloaded = false): boolean {
    if(e.id && !this.entities.has(e.id)) {
      // Load the location if needed
      if(!preloaded) {
        this.addView(e, e.position);
      }
      // Add the entity to full list
      this.entities.add(e.id);
      const chunkIndex = e.position.toChunkSpace().getIndexString();
      if(!this.entitiesByChunk.has(chunkIndex)) {
        this.entitiesByChunk.set(chunkIndex, new Set<string>());        
      }
      this.entitiesByChunk.get(chunkIndex)?.add(e.id);
      return true;
    }
    return false;
  }

  removeEntity(e: IEntity): boolean {
    if(e.id && this.entities.has(e.id)) {
      this.entities.delete(e.id);
      const chunk = e.position.toChunkSpace().getIndexString();
      this.entitiesByChunk.get(chunk)?.delete(e.id); 
      return true;
    }
    return false;
  }

  moveEntity(entity: IEntity, from: Vector, to: Vector) {
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
          this.entitiesByChunk.set(newString, new Set<string>([entity.id]));
        }
        else {
          this.entitiesByChunk.get(newString)!.add(entity.id);
        }
      }
    }
  }

  // Add 
  addView(e: IEntity, to: Vector, from?: Vector) {
    if(this.streaming) {
      const { id, active } = e;
      const change = this.scope.addViewer(id, active ? Game.getInstance().viewDistance : Game.getInstance().inactiveViewDistance, to, from);
      for(let s of change.added) {
        const v = Vector.fromIndexString(s);
        this.initializeChunk(v.x, v.y);
      }
    }
  }
  
  removeView(e: IEntity, from: Vector, to?: Vector) {
    if(this.streaming) {
      const { id, active } = e;
      const change = this.scope.removeViewer(id, active ? Game.getInstance().viewDistance : Game.getInstance().inactiveViewDistance, from, to);
      for(let s of change.removed) {
        this.baseLayer.forgetChunk(s);
      }
    }
  }

  getEntitiesWithinRadius(point: Vector, radius: number) {
    // TODO implement this
  }

  getEntitiesAtCoordinates(x: number, y: number): IEntity[] {
    let entities: IEntity[] = [];
    const chunk = new Vector(x, y).toChunkSpace().getIndexString();
    const entitiesInChunk = this.entitiesByChunk.get(chunk);
    if(entitiesInChunk) {
      const v = new Vector(x, y);
      for(const id of entitiesInChunk) {
        const entity = undefined;// Game.getEntity(id);
        if(entity) {
          entities.push(entity);
        }
      }
    }
    return entities;
  }

  getTile(x: number, y: number, layer?: string): any {
    // if(layer && this.additionalLayers.has(layer)) {
    //   return this.additionalLayers.get(layer)?.getTile(x, y);
    // } else {
      return this.baseLayer.getTile(x, y);
    // }
  }

  // getTileAll(x: number, y: number): any {
  //   const t:any = {};
  //   t['base'] = this.baseLayer.getTile(x, y);
  //   for(let k in this.additionalLayers) {
  //     t[k] = this.additionalLayers.get(k)?.getTile(x, y);
  //   }
  // }

  initializeChunk(x: number, y: number) {
    const baseChunk: IChunk = this.baseLayer.initializeChunk(x, y);
    // for(let k in this.additionalLayers) {
    //   this.additionalLayers.get(k)?.initializeChunk(x, y, baseChunk);
    // }
    if(this.streaming) {
      this.populateChunk(x, y, baseChunk);
    }
  }

  populateChunk(x: number, y: number, chunk: IChunk): void { }

  // TODO setTile and _setTile

  modify(a: Action) {

  };

  react(a: Action) {
    
  };

  createScope(): Scope {
    return new Scope(this.width, this.height);
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

export namespace World {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    fill?: number,
    width?: number,
    height?: number,
    streaming?: boolean,
    additionalLayers?: any
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
    return new ClientWorld(json);
  }
}

export function getChunkSpaceCoordinates(i: number): number {
  return Math.floor(i / CHUNK_WIDTH);
}
