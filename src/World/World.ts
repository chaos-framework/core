import Component, { ComponentContainer } from '../EntityComponent/Component';
import { Listener } from '../Events/Interfaces';
import Action from '../Events/Action';

import { ILayer } from './Layer';
import { IChunk } from './Chunk';
import Entity from '../EntityComponent/Entity';
import Vector from '../Math/Vector';
import { Game } from '../Game/Game';

export const CHUNK_WIDTH = 16;

export default abstract class World implements ComponentContainer, Listener {
  components: Component[] = [];
  baseLayer: ILayer;
  additionalLayers: Map<string, ILayer> = new Map<string, ILayer>();

  entities: Set<number> = new Set<number>();
  entitiesByChunk: Map<string, Set<number>> = new Map<string, Set<number>>();

  width?: number;
  height?: number;

  streaming: boolean = false; // whether or not to load/unload chunks from memory
  ephemeral: boolean = true;  // should be forgotten + all contained entities deleted when unloaded

  constructor(baseLayer: ILayer, {width, height, streaming = false, additionalLayers}: {width: number, height: number, streaming?: boolean, additionalLayers?: any}) {
    this.baseLayer = baseLayer;
    this.width = width;
    this.height = height;
    this.streaming = streaming;

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

  addEntity(e: Entity): boolean {
    if(e.id) {
      // Add the entity to full list
      this.entities.add(e.id);
      const chunkIndex = e.position.toChunkSpace().getIndexString();
      if(!this.entitiesByChunk.has(chunkIndex)) {
        this.entitiesByChunk.set(chunkIndex, new Set<number>());        
      }
      this.entitiesByChunk.get(chunkIndex)?.add(e.id);
      return true;
    }
    return false;
  }

  removeEntity(e: Entity): boolean {
    if(e.id && this.entities.has(e.id)) {
      this.entities.delete(e.id);
      const chunk = getXYString(e.position.x, e.position.y);
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
          this.entitiesByChunk.set(newString, new Set<number>([entity.id]));
        }
        else {
          this.entitiesByChunk.get(newString)!.add(entity.id);
        }
      }
    }
  }

  getEntitiesWithinRadius(point: Vector, radius: number) {
    // TODO implement this
  }

  getEntitiesAtCoordinates(x: number, y: number): Entity[] {
    let entities: Entity[] = [];
    const chunkSpacePosition = new Vector(x, y).toChunkSpace();
    const chunk = getXYString(chunkSpacePosition.x, chunkSpacePosition.y);
    const entitiesInChunk = this.entitiesByChunk.get(chunk);
    if(entitiesInChunk) {
      const v = new Vector(x, y);
      for(const id of entitiesInChunk) {
        const entity = Game.getEntity(id);
        if(entity) {
          entities.push(entity);
        }
      }
    }
    return entities;
  }

  getTile(x: number, y: number, layer?: string): any {
    if(layer && this.additionalLayers.has(layer)) {
      return this.additionalLayers.get(layer)?.getTile(x, y);
    } else {
      return this.baseLayer.getTile(x, y);
    }
  }

  getTileAll(x: number, y: number): any {
    const t:any = {};
    t['base'] = this.baseLayer.getTile(x, y);
    for(let k in this.additionalLayers) {
      t[k] = this.additionalLayers.get(k)?.getTile(x, y);
    }
  }

  initializeChunk(x: number, y: number) {
    const baseChunk: IChunk = this.baseLayer.initializeChunk(x, y);
    for(let k in this.additionalLayers) {
      this.additionalLayers.get(k)?.initializeChunk(x, y, baseChunk);
    }
  }

  // TODO setTile and _setTile

  modify(a: Action) {

  };

  react(a: Action) {
    
  };

  abstract serialize(): string; // Serialize metadata
  abstract unserialize(data: string): World;  // Unserialize metadata

}

export function getChunkSpaceCoordinates(i: number): number {
  return Math.floor(i / CHUNK_WIDTH);
}

export function getXYString(x: number, y: number): string {
  if(Number.isInteger(x) && Number.isInteger(y)) {
    return x.toString() + "_" + y.toString();
  }
  throw new Error();
}
