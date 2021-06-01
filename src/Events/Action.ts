import { listeners } from 'process';
import { ComponentContainer } from '..';
import { Viewer } from '../Game/Interfaces';
import { Game, MessageType, Entity, Component, Event, Permission, SensoryInformation } from '../internal';
import { NestedChanges } from '../Util/NestedMap';

export abstract class Action {
  messageType: MessageType = MessageType.ACTION;

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
  
  movementAction: boolean = false;  // whether the action involves movement, and therefore possible scope / visibility change
  sensors = new Map<string, SensoryInformation | boolean>();

  visibilityChanges?: { type: 'addition' | 'removal', changes: NestedChanges }

  static universallyRequiredFields: string[] = ['tags', 'breadcrumbs', 'permitted'];

  constructor({ caster, using, tags }: ActionParameters = {}) {
    this.caster = caster;
    this.using = using;
    this.permissions.set(0, new Permission(true));
    if (tags) {
      tags.map(tag => this.tags.add(tag));
    }
  }

  execute(force: boolean = true): boolean {
    const game = Game.getInstance();

    this.initialize();

    // If target is unpublished, just run through locally attached components (these may need to do work before publishing)
    if (this.target && !this.target.isPublished()) {
      // Just let the target modify and react directly
      this.target.modify(this);
      this.decidePermission();
      if (this.permitted || force) {
        this.apply();
      }
      this.target.react(this);
      return true;
    }

    // Get listeners (entities, maps, systems, etc) in order they should modify/react
    const listeners = this.getListeners();

    // Let all listeners sense
    for (const listener of listeners) {
      this.sensors.set(listener.id, listener.sense(this));
    }
    // Assume that caster has full awareness
    if(this.caster) {
      this.sensors.set(this.caster.id, true);
    }

    // Let all listeners modify, watching to see if any cancel the action
    for (const listener of listeners) {
      listener.modify(this);
    }

    // See if this action was not permitted by any modifiers
    this.decidePermission();

    // Apply this action to the target, checking for success
    let applied = false;
    if(this.permitted || force) {
      applied = this.apply();
    }

    // Queue in the game
    game.queueForBroadcast(this);

    this.teardown();

    // Let all listeners react
    for (const listener of listeners) {
      listener.react(this);
    }

    return applied;
  }

  getListeners(): ComponentContainer[] {
    const listenRadius = Game.getInstance().listenDistance;
    const listeners: ComponentContainer[] = [];

    // Cache entities near the caster, to differentiate/exclude from those near the target
    const casterNearby = new Set<string>();

    // Add the caster, caster's world, and nearby entities (if caster specified)
    if (this.caster !== undefined) {
      listeners.push(this.caster);
      casterNearby.add(this.caster.id);
      if (this.caster.world !== undefined) {
        listeners.push(this.caster.world);
        // Add all nearby entities
        this.caster.world.getEntitiesWithinRadius(this.caster.position, listenRadius).forEach(entity => {
          if(entity.id !== this.caster!.id && entity.id !== this.target?.id) {
            listeners.push(entity)
            casterNearby.add(entity.id);
          }
        });
      }
    }

    // Add the game itself :D
    listeners.push(Game.getInstance());

    // Add the target (if different from casting entity), target's world (if different from caster), and nearby entities not already added by caster
    if (this.target !== undefined && this.target !== this.caster) {
      if (this.target.world !== undefined && this.caster?.world !== this.target.world) {
        listeners.push(this.target.world);
      }
      if(this.target.world !== undefined) {
        this.target.world.getEntitiesWithinRadius(this.target.position, listenRadius).forEach(entity => {
          // note that caster, if exists, is already added to casterNearby
          if(entity.id !== this.target!.id && !casterNearby.has(entity.id)) {
            listeners.push(entity)
          }
        });
      }
      listeners.push(this.target);
    }

    return listeners;
  }

  permit({ priority = 0, by, using, message }: { priority?: number, by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    this.addPermission(true, { priority, by, using, message });
  }

  deny({ priority = 0, by, using, message }: { priority?: number, by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    this.addPermission(false, { priority, by, using, message });
  }

  addPermission(permitted: boolean, { priority = 0, by, using, message }: { priority?: number, by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    const previous = this.permissions.get(priority);
    if (previous === undefined) {
      // Add directly if this has never been added
      this.permissions.set(priority, new Permission(permitted, { by, using, message }));
    }
    else {
      // Override the previous at this priority if the new one is a denial and the previous is an allowance
      if (previous.permitted && !permitted) {
        this.permissions.set(priority, new Permission(permitted, { by, using, message }));
      }
    }
  }

  decidePermission() {
    // Find the highest ranked allow/forbid
    let highest = 0;
    for (const [key, value] of this.permissions) {
      if (key >= highest) {
        highest = key;
        this.decidingPermission = value;
        this.permitted = value.permitted;
      }
    }
  }

  tagged(key: string): boolean {
    return this.tags.has(key);
  }

  is(key: string): boolean {
    return this.tags.has(key);
  }

  sense(entity: Entity, information: SensoryInformation | boolean) {
    
  }

  counter(a: Action) {
    a.nested = this.nested + 1;
    if (a.nested < 5) {
      a.execute();
    }
  }

  react(a: Action) {
    a.nested = this.nested + 1;
    if (a.nested < 10) {
      a.execute();
    } else {
      // TODO figure out logging / errors, then throw one for reactions that are obviously cyclicle
    }
  }

  followup(o: Action | Event): void {
    Game.getInstance().actionQueue.enqueue(o);
  }

  static serializedHasRequiredFields(json: any, additional: string[]): boolean {
    for (const key of this.universallyRequiredFields) {
      if (!json[key]) {
        return false;
      }
    }
    for (const key of additional) {
      if (!json[key]) {
        return false;
      }
    }
    return true;
  }

  static deserializeCommonFields(json: Action.Serialized): Action.Deserialized {
    const game = Game.getInstance();
    const caster: Entity | undefined = json.caster ? game.getEntity(json.caster) : undefined;
    const target: Entity | undefined = json.target ? game.getEntity(json.target) : undefined;
    const using: Entity | undefined = json.using ? game.getEntity(json.using) : undefined;
    const tags = json.tags;
    const permitted = json.permitted;
    return { caster, target, using, tags, permitted };
  }

  abstract apply(): boolean;

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    const worldScopes = viewer.getWorldScopes();
    const { caster } = this;
    const relevantEntity = this.getEntity();
    if(caster && caster.world && worldScopes.has(caster.world.id) && worldScopes.get(caster.world.id)!.containsPosition(caster.position)) {
      return true;
    }
    if(relevantEntity && relevantEntity.world && worldScopes.has(relevantEntity.world.id) && worldScopes.get(relevantEntity.world.id)!.containsPosition(relevantEntity.position)) {
      return true;
    }
    return false;
  };

  // Get the relevant entity, by default the target but some actions apply to an entity that is not the target
  getEntity(): Entity | undefined {
    return this.target;
  }

  // TODO make abstract -- only concrete so I can run tests before fully implementing in all children
  serialize(): Action.Serialized {
    return {
      caster: this.caster?.id,
      target: this.target?.id,
      using: this.using?.id,
      tags: Array.from(this.tags),
      permitted: this.permitted
    };
  }

  // TODO abstract unserialize(json: any, game: Game): Action;

  initialize(): void { };
  teardown(): void { };
}

// tslint:disable-next-line: no-namespace
export namespace Action {
  export interface Serialized {
    caster?: string,
    target?: string,
    using?: string,
    tags?: string[],
    permitted: boolean
  }

  export interface Deserialized {
    caster?: Entity,
    target?: Entity,
    using?: Entity,
    tags?: string[],
    permitted: boolean
  }
}

export interface ActionParameters {
  caster?: Entity,
  using?: Entity | Component,
  tags?: string[]
}