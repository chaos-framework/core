import Property from './Property';
import Component, { ComponentContainer } from './Component';
import Event from '../Events/Event';
import Action from '../Events/Action';
import { Listener, Modifier, Reacter, isModifier, isReacter } from '../Events/Interfaces';
import Ability, { OptionalCastParameters, Grant } from './Ability';

// Import actions that can be created by the component
import AttachComponentAction, { AttachComponentActionParameters } from '../Events/Actions/ComponentActions';
import { GrantAbility, DenyAbility, AbilityActionParameters } from '../Events/Actions/AbilityActions';
import EquipAction, { EquipActionParameters } from '../Events/Actions/EquipmentActions';
import { AddSlotAction, RemoveSlotAction, SlotActionParameters } from '../Events/Actions/SlotActions';

export default class Entity implements Listener {
  private static idCounter = 0;
  id?: number;
  tags: Set<string>; // TODO make set
  published = false;
  active = false;
  omnipotent = false; // listens to every action in the game

  properties: { [name: string]: Property };

  components: Component[] = [];

  modifiers: Modifier[] = [];
  reacters: Reacter[] = [];

  abilities: Map<string, Grant[]> = new Map<string, Grant[]>();

  // Places for items to be equipped
  slots: Map<string, Entity | undefined> = new Map<string, Entity | undefined>();
  // TODO Inventory array -- places for items to be stored -- probably needs to be a class to store size info

  // TODO position / coordinates

  map: any;
  container: any; // TODO can this be combined with map?

  // TODO art asset
  // TODO single char for display in leiu of art asset

  constructor(serialized?: object) {
    // TODO create from serialized to load from disk/db, and don't increment entity count
    this.properties = {};
    this.components = [];
    this.tags = new Set<string>();
  }

  publish() {
    this.id = ++Entity.idCounter;
    this.active = true;
  }

  isPublished(): boolean {
    return this.id !== undefined;
  }

  activate() {
    this.active = true;
    // TODO attach listeners?
  }

  deactivate() {
    this.active = false;
    // TODO remove listeners?
  }

  static setIdCount(i: number): void {
    Entity.idCounter = i;
  }

  modify(a: Action) {
    this.modifiers.map(r => r.modify(a));
  }

  _modify(a: Action) {
    this.components.map(c => { 
      if(isModifier(c)) { 
        c.modify(a) 
      }
    });
    for(let item of this.slots) {
      if(item instanceof Entity) {
        item._modify(a);
      }
    }
  }
  
  react(a: Action) {
   this.reacters.map(r => r.react(a));
  }
  
  _react(a: Action) {
    this.components.map(c => { 
      if(isReacter(c)) { 
        c.react(a) 
      }
    });
    for(let item of this.slots) {
      if(item instanceof Entity) {
        item._react(a);
      }
    }
  }

  getProperty(k: string): Property {
    return this.properties[k];
  }

  tag(tag: string) {
    this.tags.add(tag);    
  }

  untag(tag: string) {
    this.tags.delete(tag);
  }

  tagged(tag: string): boolean {
    return this.tags.has(tag);
  }

  is(component: string | Component): Component | undefined  {
    return this.has(component);
  }

  has(component: string | Component): Component | undefined {
    if (component instanceof String) {
      return this.components.find(c => c.constructor === component.constructor);
    }
    else {
      return this.components.find(c => c.name === component);
    }
  }

  can(ability: string): boolean {
    return this.abilities.has(ability);
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

  // or just equip null? I feel like it needs to move into another slot, though
  unequip(): boolean {
    return false;
  }

  // Cast ability by name and optional lookup for specific version based on how we're casting it
  cast(abilityName: string, {using, target, options}: OptionalCastParameters = {}): Event | undefined {
    // See if we have this ability at all
    const grants = this.abilities.get(abilityName);
    if(grants && grants.length > 0) {
      // Use the verion of this ability granted by 
      let grant: Grant | undefined = using ? grants.find(g => g.using === using) : undefined;
      if(!grant)
        grant = grants[0];
      const e = grant.ability.cast(this, { using, target, options });
      e.execute();
      return e;
    }
    return undefined;
  }

  /*****************************************
   * 
   *  ACTION GENERATORS / IMPLEMENTATIONS
   * 
   *****************************************/

  // Attaching components

  attach({component, caster, using, tags}: AttachComponentActionParameters, force = false): AttachComponentAction {
    let name = "Jenn";
    return new AttachComponentAction({ caster, target: this, component, using, tags});
  };


  _attach(component: Component): boolean {
    this.components.push(component); // TODO check for unique flag, return false if already attached
    // Add listeners, if appropriate
    switch(component.scope) {
      default:
        if(isModifier(component)) {
          this.modifiers.push(component);
        }
        if(isReacter(component)) {
          this.reacters.push(component);
        }
        break;
    }
    // Run component's attach method
    //component.attach(this);
    return true;
  }

  // Granting abilities

  grant({caster, using, ability, tags}: AbilityActionParameters, force = false) {
    return new GrantAbility({caster, target: this, using, ability, tags});
  }

  _grant(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
    const name = ability.name;
    const grants = this.abilities.get(name);
    if(grants) {
      // check if ability already granted by this combo
      const duplicate = grants.find(grant => grant.grantedBy === grantedBy && grant.using === using);
      if(!duplicate) {
        grants.push(new Grant(ability, grantedBy, using));
      } else {
        return false;
      }
    } else {
      this.abilities.set(name, [new Grant(ability, grantedBy, using)]);
    }
    return true;
  }

  // Denying abilities

  deny({caster, using, ability, tags}: AbilityActionParameters, force = false) {
    return new DenyAbility({caster, target: this, using, ability, tags});
  }

  _deny(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
    const name = ability.name;
    let grants = this.abilities.get(name);
    if(!grants) {
      return false;
    }
    const grantIndex = grants.findIndex(grant => grant.grantedBy === grantedBy && grant.using === using);
    if(grantIndex < 0) {
      return false;
    }

    grants.splice(grantIndex, 1);

    // Replace the array of grants for this ability, or delete if it's no longer granted by anything
    if (grants.length > 0) {
      this.abilities.set(name, grants);
    } else {
      this.abilities.delete(name);
    }

    return true;
  }

  // Equipping items

  equip({caster, slot, item, tags = []}: EquipActionParameters, force = false): EquipAction {
    return new EquipAction({caster, target: this, slot, item, tags});
  }

  _equip(item: Entity, slotName: string): boolean {
    if(this.slots.has(slotName) && this.slots.get(slotName) === undefined) {
      this.slots.set(slotName, item);
      if(item instanceof Entity || isModifier(item)) {
        this.modifiers.push(item);
      }
      if(item instanceof Entity || isReacter(item)) {
        this.reacters.push(item);
      }
      // TODO should item decide to remove from parent container?
      return true;
    }
    return false;
  }

  // Unequipping items
  // TODO

  // Slot changes

  addSlot({caster, name, tags = []}: SlotActionParameters, force = false): AddSlotAction {
    return new AddSlotAction({caster, target: this, name, tags});
  }

  _addSlot(name: string): boolean {
    if(!this.slots.has(name)) {
      this.slots.set(name, undefined);
      return true;
    }
    return false;
  }

  removeSlot({caster, name, tags = []}: SlotActionParameters, force = false): RemoveSlotAction {
    return new RemoveSlotAction({caster, target: this, name, tags});
  }

  _removeSlot(name: string): boolean {
    if(this.slots.has(name)) {
      // TODO, have to drop item on the ground, or something
      this.slots.delete(name);
      return true;
    }
    return false;
  }
  

  // TODO change maps, swap map listeners

}
