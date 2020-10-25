import Property from './Property';
import Component, { ComponentContainer } from './Component';
import Event from '../Events/Event';
import Action from '../Events/Action';
import { Listener, Modifier, Reacter, isModifierComponent, isReacterComponent } from '../Events/Interfaces';
import Ability, { Grant } from './Ability';

export default class Entity implements ComponentContainer, Listener {
  private static idCounter = 0;
  readonly id: number;
  tags: Set<string>; // TODO make set
  readonly omnipotent: boolean = false; // listens to every action in the game

  properties: { [name: string]: Property };

  components: Component[] = [];

  modifiers: Modifier[] = [];
  reacters: Reacter[] = [];

  abilities: { [name: string]: Grant[] } = {};
  slots: { [name: string]: Entity | null } = {};

  // TODO position / coordinates

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

  attach(component: Component): boolean {
    this.components.push(component); // TODO check for unique flag, return false if already attached
    // Add listeners, if appropriate
    switch(component.scope) {
      default:
        if(isModifierComponent(component)) {
          this.modifiers.push(component);
        }
        if(isReacterComponent(component)) {
          this.reacters.push(component);
        }
        break;
    }
    // Run component's attach method
    component.attach(this);
    return true;
  }

  detach(component: Component): boolean {
    const i = this.components.indexOf(component);
    if(i >= 0) {
      this.components.splice(i, 1);
      // TODO remove listeners on entity and others
      return true;
    }
    else {
      // TODO handle error
      return false;
    }
  }

  grant(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component) {
    const name = ability.name;
    if(!this.abilities[name]) {
      this.abilities[name] = [new Grant(ability, grantedBy, using)];
    }
    else {
      this.abilities[name].push(new Grant(ability, grantedBy, using));
    }
  }

  // TODO slots, and putting entities
  equip(item: Entity, slotName: string): boolean {
    if(slotName in this.slots && this.slots[slotName] === undefined) {
      this.slots[slotName] = item;
      return true;
    }
    return false;
  }

  // or just equip null? I feel like it needs to move into another slot, though
  unequip(): boolean {
    return false;
    // TODO remove abilities granted by this item, if any
  }

  grantSlot(name: string): boolean {
    if(!this.slots[name]) {
      this.slots[name] = null;
      return true;
    }
    return false;
  }

  removeSlot(name: string): boolean {
    if(this.slots[name]) {
      // TODO, have to drop item on the ground, or something
      delete this.slots[name];
      return true;
    }
    return false;
  }

  // Cast ability by name and optional lookup for specific version based on how we're casting it
  cast(abilityName: string, using?: Entity | Component, target?: any, options?: any): Event | undefined {
    // See if we have this ability at all
    const grants = this.abilities[abilityName];
    if(grants && grants.length > 0) {
      // Use the verion of this ability granted by 
      let grant: Grant | undefined = grants.find(g => g.using === using);
      if(!grant)
        grant = grants[0];
      const e = grant.ability.cast(this, target, options);
      e.execute();
      return e;
    }
    return undefined;
  }

  // TODO change maps, swap map listeners

}
