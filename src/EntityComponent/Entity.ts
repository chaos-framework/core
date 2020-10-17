import Property from './Property';
import Component, { ComponentContainer } from './Component';
import Action from '../Events/Action';
import { Listener, Modifier, Reacter} from '../Events/Interfaces';

export default class Entity implements ComponentContainer, Listener {
  private static idCounter = 0;
  readonly id: number;
  tags: Set<string>; // TODO make set

  properties: { [name: string]: Property };

  components: Component[] = [];

  modifiers: Modifier[] = [];
  reacters: Reacter[] = [];

  // TODO formalize position coordinates into class
  x: number = 0;
  y: number = 0;

  map: any;

  constructor(serialized?: object) {
    // TODO create from serialized to load from disk/db, and don't increment entity count
    this.id = ++Entity.idCounter;
    this.properties = {};

    this.components = [];
    

    this.tags = new Set<string>();
  }

  static setIdCount(i: number): void {
    Entity.idCounter = i;
  }

  modify(a: Action) {
    for(let i = 0; i < this.modifiers.length && !a.cancelled; i++) {
      this.modifiers[i].modify(a);
    }
  }

  react(a: Action) {
    for(let i = 0; i < this.reacters.length && !a.cancelled; i++) {
      this.reacters[i].react(a);
    }
  }

  getProperty(k: string): Property {
    return this.properties[k];
  }

  tag(tag: string): void {
    // TODO add to tags, tag needs to be made set first
  }

  tagged(tag: string): boolean {
    // TODO check if tagged, return true/false
    return false;
  }

  // Check if this Entity "is" (has) as certain component
  is(name: string): boolean {

  }

  addTrait(t: Component) {
    this.traits.push(t);
    t.parent = this;
  }

  removeTrait(t: Component) {
    const i = this.traits.findIndex(c => c === t);
    this.traits.splice(i, 1);
  }

}
