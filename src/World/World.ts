import Component, { ComponentContainer } from '../EntityComponent/Component';
import { Listener } from '../Events/Interfaces';
import Action from '../Events/Action';

import Layer from './Layer';
import { ShortLayer } from './Layer';

export default class World implements ComponentContainer, Listener {
  components: Component[] = [];
  baseLayer: ShortLayer = new ShortLayer();
  additionalLayers: Map<string, Layer<any>> = new Map<string, Layer<any>>();

  constructor() {
  }

  modify(a: Action) {

  };

  react(a: Action) {
    
  };
}
