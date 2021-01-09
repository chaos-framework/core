import Game from '../Game/Game';
import Entity from "../EntityComponent/Entity";
import Component from "../EntityComponent/Component";
import { Listener } from './Interfaces';

export default abstract class Action {
  // TODO implement player: Player;
  caster?: Entity;
  target?: Entity;
  using?: Entity | Component;
  tags: Set<string> = new Set<string>();
  breadcrumbs: Set<string> = new Set<string>();
  public: boolean = false;  // whether or not nearby entities (who are not omnipotent) can modify/react
  absolute: boolean = false; // absolute actions do not get modified, likely come from admin / override code
  private permissions: Map<number, Permission> = new Map();
  permitted: boolean = true;
  decidingPermission?: Permission;
  nested: number = 0;

  constructor({caster, using, tags}: ActionParameters = {}) {
    this.caster = caster;
    this.using = using;
    this.permissions.set(0, new Permission(true));
    if(tags){
      tags.map(tag => this.tags.add(tag));
    }
  }

  execute(force: boolean = true): boolean {
    const game = Game.getInstance();

    this.initialize();

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
    // TODO caster world
    listeners.push(game);
    // TODO target world, if different from caster's
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
    
    // Queue in the game
    game.enqueueAction(this);

    this.teardown();

    // Let all listeners react
    for(let listener of listeners) {
      listener.react(this);
    }

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
      if(key >= highest) {
        highest = key;
        this.decidingPermission = value;
        this.permitted = value.permitted;
      }
    }
  }

  is(key: string): boolean {
    return this.tags.has(key);
  }

  counter(a: Action) {
    a.nested = this.nested + 1;
    if(a.nested < 5) {
      a.execute();
    }
  };

  react(a: Action) {
    a.nested = this.nested + 1;
    if(a.nested < 10) {
      a.execute();
    } else {
      // TODO figure out logging / errors, then throw one for reactions that are obviously cyclicle
    }
  };

  abstract apply(): boolean;
  initialize(): void {};
  teardown(): void {};
}

export interface ActionParameters {
  caster?: Entity,
  using?: Entity | Component,
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


// TODO Inventory resizing action
// TODO inventory rearranging action

// TODO speaking, in-character or otherwise