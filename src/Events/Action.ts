import Component from "../EntityComponent/Component";
import Entity from "../EntityComponent/Entity";
import { Listener } from './Interfaces';

export default abstract class Action {
  // TODO implement player: Player;
  readonly caster: Entity;
  target?: Entity;
  using?: Entity | Component;
  tags: Set<string> = new Set<string>();
  breadcrumbs: Set<string> = new Set<string>();
  public: boolean = false;  // whether or not nearby entities (who are not omnipotent) can modify/react
  absolute: boolean = false; // absolute actions do not get modified, likely come from admin / override code
  private permissions: Map<number, Permission> = new Map();
  permitted: boolean = true;
  decidingPermission?: Permission;

  constructor(caster: Entity, using?: Entity | Component, tags?: string[]) {
    this.caster = caster;
    this.using = using;
    this.permissions.set(0, new Permission(true));
    if(tags){
      tags.map(tag => this.tags.add(tag));
    }
  }

  execute(force: boolean = true): boolean {
    // First check if the target is unpublished
    if(this.target && !this.target.isPublished()) {
      // Just let the target modify and react directly
      this.target._modify(this);
      this.decidePermission();
      let applied = false;
      if(this.permitted || force) {
        applied = this.apply();
      }
      this.target._react(this);
      return true;
    }

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
    }

    // See if this action was not permitted by any modifiers
    this.decidePermission();

    // Apply this action to the target, checking for success
    let applied = this.apply();

    // Let all listeners react
    for(let listener of listeners) {
      listener.react(this);
    }

    // TODO broadcast self to system

    return applied;
  }

  permit({ priority = 0, by, using, message }: {priority?: number,  by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    this.addPermission(true, { priority, by, using, message });
  }
  
  deny({ priority = 0, by, using, message }: {priority?: number,  by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    this.addPermission(false, { priority, by, using, message });
  }
  
  addPermission(permitted: boolean, { priority = 0, by, using, message }: {priority?: number,  by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    const previous = this.permissions.get(priority);
    if(previous === undefined) {
      // Add directly if this has never been added
      this.permissions.set(priority, new Permission(permitted, { by, using, message }));
    }
    else {
      // Override the previous at this priority if the new one is a denial and the previous is an allowance
      if(previous.permitted && !permitted) {
        this.permissions.set(priority, new Permission(permitted, { by, using, message }));
      }
    }
  }

  decidePermission() {
    // Find the highest ranked allow/forbid
    let highest = 0;
    for (let [key, value] of this.permissions) {
      if(key > highest) {
        highest = key;
        this.decidingPermission = value;
      }
    }
  }

  is(key: string): boolean {
    return this.tags.has(key);
  }

  abstract apply(): boolean;
}

export interface ActionParameters {
  caster: Entity,
  target?: Entity,
  tags?: string[]
}

export interface ActionParametersRequiringTarget {
  caster: Entity,
  target: Entity,
  tags?: string[]
}

export class Permission {
  permitted: boolean;
  by?: Entity | Component;
  using?: Entity | Component;
  message?: string;

  constructor(permitted: boolean, 
    { by, using, message }: 
    { by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
      this.permitted = permitted;
      this.by = by;
      this.using = using;
      this.message = message;
  }
}

export enum PermissionPriority {
  Base = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Dead = 3,
  Extreme = 4,
  Max = Number.MAX_VALUE
}

// export class RelativeMovement extends Action {
//   target: Entity;
//   x: number;
//   y: number;

//   constructor(caster: Entity, target: Entity, x: number, y: number, tags?: string[]) {
//     super(caster, tags);
//     this.target = target;
//     this.x = x;
//     this.y = x;
//   }

//   apply() {
//     // this.target.x += this.x;
//     // this.target.y += this.y;
//   }
// }

// export class AbsoluteMovement extends Action {
//   x: number;
//   y: number;
//   target: Entity;

//   constructor(caster: Entity, target: Entity, x: number, y: number, tags?: string[]) {
//     super(caster, tags);
//     this.target = target;
//     this.x = x;
//     this.y = x;
//   }

//   apply() {
//     // this.target.x = this.x;
//     // this.target.y = this.y;
//   }
// }

// TODO Inventory resizing action
// TODO inventory rearranging action

// TODO PropertyModification -- in temporarily increase max

// export class MapChange extends Action {
//   constructor(caster: Entity) {
//     super(caster);
//   }
// }

// TODO speaking, in-character or otherwise