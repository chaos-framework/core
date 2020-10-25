import Entity from "../EntityComponent/Entity";
import Component from "../EntityComponent/Component";
import { Listener } from './Interfaces';
import { PropertyType } from "../EntityComponent/Property";

export default abstract class Action {
  // TODO implement player: Player;
  readonly caster: Entity;
  target?: Entity;
  tags: Set<string> = new Set<string>();
  breadcrumbs: Set<string> = new Set<string>();
  cancelled: boolean = false;
  public: boolean = false;  // whether or not nearby entities (who are not omnipotent) can modify/react
  absolute: boolean = false; // absolute actions do not get modified, likely come from admin / override code
  // TODO modifications?

  constructor(caster: Entity, tags?: string[]) {
    this.caster = caster;
    if(tags){
      tags.map(tag => this.tags.add(tag));
    }
  }

  execute(): void {
    // Get listeners (entities, maps, systems, etc) in order they should modify/react
    let listeners: Listener[] = [];
    if(this.caster) {
      listeners.push(this.caster);
      if(this.caster.map) {
        listeners.push(this.caster.map);
      }
    }
    // TODO add systems
    if(this.target && this.target != this.caster) {
      if(this.caster && this.caster.map != this.target.map) {
        listeners.push(this.target.map);
      }
      listeners.push(this.target);
    }

    // Let all listeners modify, watching to see if any cancel the action
    for(let listener of listeners) {
      listener.modify(this);
      if(this.cancelled) {
        break;
      }
    }

    if(this.cancelled) {
      return; // TODO how to handle gracefully, message users about failure, etc
    }

    // Apply this action to the target
    this.apply();

    // Let all listeners react
    for(let listener of listeners) {
      listener.react(this);
    }

    // TODO broadcast self to system
  }

  is(key: string): boolean {
    return this.tags.has(key);
  }

  abstract apply(): void;
}

export class RelativeMovement extends Action {
  target: Entity;
  x: number;
  y: number;

  constructor(caster: Entity, target: Entity, x: number, y: number, tags?: string[]) {
    super(caster, tags);
    this.target = target;
    this.x = x;
    this.y = x;
  }

  apply() {
    // this.target.x += this.x;
    // this.target.y += this.y;
  }
}

export class AbsoluteMovement extends Action {
  x: number;
  y: number;
  target: Entity;

  constructor(caster: Entity, target: Entity, x: number, y: number, tags?: string[]) {
    super(caster, tags);
    this.target = target;
    this.x = x;
    this.y = x;
  }

  apply() {
    // this.target.x = this.x;
    // this.target.y = this.y;
  }
}

export class PropertyAdjustment extends Action {
  target: Entity;
  property: string;
  amount: number;
  finalAmount: number;
  adjustments: number[] = [];
  multipliers: number[] = [];

  constructor(caster: Entity, target: Entity, property: string, amount: number, tags?: string[]) {
    super(caster, tags);
    this.target = target;
    this.property = property;
    this.amount = amount;
    this.finalAmount = amount;
  }

  apply() {
    this.adjustments.map(amount => this.finalAmount += amount);
    this.multipliers.map(amount => this.finalAmount *= amount);
    // TODO figure out property adjustments
  }

  adjust(amount: number, breadcrumbs?: string[], unique?: boolean) {
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.adjustments.push(amount);
  }

  multiply(amount: number, breadcrumbs?: string[], unique?: boolean) {
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.multipliers.push(amount);
  }

  effects(key: string): boolean {
    return key === this.property;
  }

}

export class Equip extends Action {
  slot: string; // TODO make reference
  equipment: Entity;
  cancelled = true; // assume cancelled until something allows it

  constructor(caster: Entity, target: Entity, slot: string, equipment: Entity, tags?: string[]) {
    super(caster, tags);
    this.target = target;
    this.slot = slot;
    this.equipment = equipment;
  }

  apply() {

  }
}

// TODO PropertyModification

// export class MapChange extends Action {
//   constructor(caster: Entity) {
//     super(caster);
//   }
// }


// export class StatusApply extends Action {
//   constructor(caster: Entity) {
//     super(caster);
//   }
// }

// TODO speaking, in-character or otherwise