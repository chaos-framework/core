import Entity from "../EntityComponent/Entity";
import Component from "../EntityComponent/Component";
import { Listener } from './Interfaces';

export default abstract class Action {
  // TODO implement player: Player;
  readonly caster: Entity;
  target?: Entity;
  tags: String[] = [];
  breadcrumbs: String[] = [];
  cancelled: boolean = false;
  // TODO modifications?

  constructor(caster: Entity, tags?: String[]) {
    this.caster = caster;
    if(tags){
      this.tags = tags;
    }
  }

  execute(): void {
    // Get listeners (entities, maps, systems, etc) in order they should modify/react
    let listeners: Listener[] = [];
    if(this.caster) {
      listeners.push(this.caster);
      listeners.push(this.caster.map);
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

  abstract apply(): void;
}

export class RelativeMovement extends Action {
  x: number;
  y: number;

  constructor(caster: Entity, target: Entity, x: number, y: number, tags?: String[]) {
    super(caster, tags);
    this.target = target;
    this.x = x;
    this.y = x;
  }

  apply() {
    this.mover.x += this.x;
    this.mover.y += this.y;
  }
}

export class AbsoluteMovement extends Action {
  x: number;
  y: number;

  constructor(caster: Entity, target: Entity, x: number, y: number, tags?: String[]) {
    super(caster, tags);
    this.target = target;
    this.x = x;
    this.y = x;
  }

  apply() {
    this.mover.x = this.x;
    this.mover.y = this.y;
  }
}

export class PropertyAdjustment extends Action {
  target: Entity;
  property: String;
  amount: number;

  constructor(caster: Entity, target: Entity, property: string, amount: number, tags?: String[]) {
    super(caster, tags);
    this.target = target;
    this.property = property;
    this.amount = amount;
  }

  apply() {
    // TODO figure out property adjustments
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
