import Component, { ComponentContainer } from '../EntityComponent/Component';
import { Listener } from '../Events/Interfaces';
import Action from '../Events/Action';

import { ILayer } from './Layer';
import { ShortLayer } from './Layer';

export default class World implements ComponentContainer, Listener {
  components: Component[] = [];
  baseLayer: ILayer;
  additionalLayers: Map<string, ILayer> = new Map<string, ILayer>();

  constructor() {
  }

  modify(a: Action) {

  };

  react(a: Action) {
    
  };
}
