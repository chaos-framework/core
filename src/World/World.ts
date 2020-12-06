import Component, { ComponentContainer } from '../EntityComponent/Component';
import { Listener } from '../Events/Interfaces';
import Action from '../Events/Action';

import Layer, { ILayer } from './Layer';
import Entity from '../EntityComponent/Entity';
import Vector from '../Math/Vector';
import { Game } from '../Game/Game';

export default class World implements ComponentContainer, Listener {
  components: Component[] = [];
  baseLayer: ILayer;
  additionalLayers: Map<string, ILayer> = new Map<string, ILayer>();

  entities: Set<number> = new Set<number>();
  entitiesByChunk: Map<string, Set<number>> = new Map<string, Set<number>>();

  constructor(baseLayer: ILayer) {
    this.baseLayer = baseLayer;
  }

  addEntity(e: Entity, x: number, y: number): boolean {
    if(e.id) {
      // Add the entity to full list
      this.entities.add(e.id);
      const chunk = Layer.getXYString(x, y);
      if(!this.entitiesByChunk.has(chunk)) {
        this.entitiesByChunk.set(chunk, new Set<number>());
      } else {
        this.entitiesByChunk.get(chunk)?.add(e.id);
      }
      return true;
    }
    return false;
  }

  removeEntity(e: Entity): boolean {
    if(e.id && this.entities.has(e.id)) {
      this.entities.delete(e.id);
      const chunk = Layer.getXYString(e.position.x, e.position.y);
      this.entitiesByChunk.get(chunk)?.delete(e.id); 
      return true;
    }
    return false;
  }

  getEntitiesWithRadius(x: number, y: number, radius: number) {
    // TODO complete this
  }

  getEntitiesAtCoordinates(x: number, y: number): Entity[] {
    let entities: Entity[] = [];
    const chunk = Layer.getXYString(x, y);
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

  modify(a: Action) {

  };

  react(a: Action) {
    
  };
}
