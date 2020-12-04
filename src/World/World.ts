import Component, { ComponentContainer } from '../EntityComponent/Component';
import { Listener } from '../Events/Interfaces';
import Action from '../Events/Action';

import { ILayer } from './Layer';

export default class World implements ComponentContainer, Listener {
  components: Component[] = [];
  baseLayer: ILayer;
  additionalLayers: Map<string, ILayer> = new Map<string, ILayer>();

  constructor(baseLayer: ILayer) {
    this.baseLayer = baseLayer;
  }

  modify(a: Action) {

  };

  react(a: Action) {
    
  };
}
