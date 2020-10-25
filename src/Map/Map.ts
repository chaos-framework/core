import Component, { ComponentContainer } from '../EntityComponent/Component';
import { Listener } from '../Events/Interfaces';
import Action from '../Events/Action';

export default class Map implements ComponentContainer, Listener {
  components: Component[] = [];
  attach(component: Component): boolean { return true; }
  detach(component: Component): boolean { return true; }
  modify(a: Action) {

  };
  react(a: Action) {
    
  };
}