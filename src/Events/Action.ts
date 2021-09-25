import { TerminalMessage } from '../ClientServer/Terminal/TerminalMessage';
import { Chaos, ActionType, Entity, Component, Event, ComponentContainer, BroadcastType, World,
  Permission, SensoryInformation, PublishEntityAction, NestedChanges, Viewer, Vector } from '../internal';

export abstract class Action {
  actionType: ActionType = ActionType.INVALID;
  broadcastType: BroadcastType = BroadcastType.FULL;

  terminalMessage?: TerminalMessage | ((action: Action) => TerminalMessage);
  verb?: string;

  // TODO implement player: Player;
  caster?: Entity;
  target?: Entity;
  using?: Entity | Component;

  metadata = new Map<string, string | number | boolean | undefined>();
  breadcrumbs: Set<string> = new Set<string>();

  public: boolean = false;    // whether or not nearby entities (who are not omnipotent) can modify/react
  absolute: boolean = false;  // absolute actions do not get modified, likely come from admin / override code

  private permissions: Map<number, Permission> = new Map<number, Permission>();
  permitted: boolean = true;
  decidingPermission?: Permission;

  nested: number = 0;

  movementAction: boolean = false;  // whether the action involves movement, and therefore possible scope / visibility change

  anticipators = new Set<string>();
  sensors = new Map<string, SensoryInformation | boolean>();

  visibilityChanges?: { type: 'addition' | 'removal', changes?: NestedChanges }

  listeners: ComponentContainer[] = [];
  listenerIds = new Set<string>();

  // Additional worlds and points that entities in a radius around can be included. 
  additionalListenPoints: { world: World, position: Vector }[] = [];
  // Additional listeners on top of the default caster -> target flow
  additionalListeners: ComponentContainer[] = [];

  followups: (Action | Event)[] = [];
  reactions: Action[] = [];

  // Function to run to check if the action is still feasible after any modifiers / counters etc
  feasabilityCallback?: (a?: Action) => boolean;

  static universallyRequiredFields: string[] = ['tags', 'breadcrumbs', 'permitted'];

  constructor({ caster, using, metadata }: ActionParameters = {}) {
    this.caster = caster;
    this.using = using;
    this.permissions.set(0, new Permission(true));
        // tslint:disable-next-line: forin
    for(const key in metadata) {
      this.metadata.set(key, metadata[key]);
    }
  }

  // Set the optional callback to see if the action is still possible
  if(callback: (a?: Action) => boolean): Action {
    this.feasabilityCallback = callback;
    return this;
  }

  execute(force: boolean = true): boolean {
    this.initialize();

    // If target is unpublished, just run through locally attached components (these may need to do work before publishing)
    if (this.target && !this.target.isPublished() && !(this instanceof PublishEntityAction)) {
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
    this.collectListeners();

    // Let all listeners sense
    for (const listener of this.listeners) {
      this.sensors.set(listener.id, listener.sense(this));
    }
    // Assume that caster has full awareness
    if(this.caster) {
      this.sensors.set(this.caster.id, true);
    }

    // Let all listeners modify, watching to see if any cancel the action
    for (const listener of this.listeners) {
      listener.modify(this);
    }

    // See if this action was not permitted by any modifiers
    this.decidePermission();

    // Apply this action to the target, checking for permission and if still feasible
    let applied = false;
    if ((this.permitted && this.feasabilityCallback !== undefined ? this.feasabilityCallback(this) : true) || force) {
      applied = this.apply();
    }

    // Generate terminal message
    this.generateMessage();

    // Queue in the game
    Chaos.queueForBroadcast(this);

    this.teardown();

    // Let all listeners react
    for (const listener of this.listeners) {
      listener.react(this);
    }

    return applied;
  }

  addListener(listener: ComponentContainer) {
    if(!this.listenerIds.has(listener.id)) {
      this.listeners.push(listener);
      this.listenerIds.add(listener.id);
    }
  }

  collectListeners() {
    const listenRadius = Chaos.listenDistance;

    const { caster, target } = this;

    // Add the caster, caster's world, player, teams, and nearby entities (if caster specified)
    if (caster !== undefined) {
      this.addListener(caster);
      // Add all nearby entities and the world itself, if caster is published to a world
      if (caster.world !== undefined) {
        caster.world.getEntitiesWithinRadius(caster.position, listenRadius).map(entity => {
          if(entity.id !== caster.id && entity.id !== target?.id) {
            this.addListener(entity);
          }
        });
        this.addListener(caster.world);
      }

      // Add all players that own this entity
      for (const id of caster.owners) {
        // TODO fix string vs reference
        const player = Chaos.players.get(id);
        if (player !== undefined) {
          this.addListener(player);
        }
      }

      // Add all teams that this entity belongs to 
      if (caster.team !== undefined) {
        this.addListener(caster.team);
      }
    }

    // TODO add players + teams of caster

    // Add the game itself :D
    this.addListener(Chaos.reference);

    // TODO add players + teams of target(s)

    // Add the target world, nearby entities, and target itself.. if the target !== the caster
    if(target !== undefined && target !== caster) {
      if(target.world !== undefined) {
        this.addListener(target.world);
        target.world.getEntitiesWithinRadius(target.position, listenRadius).forEach(entity => {
          this.addListener(entity);
        });
      }
      this.addListener(target);

      // Add all players that own this entity
      for (const id of target.owners) {
        // TODO fix string vs reference
        const player = Chaos.players.get(id);
        if (player !== undefined) {
          this.addListener(player);
        }
      }

      // Add all teams that this entity belongs to 
      if (target.team !== undefined) {
        this.addListener(target.team);
      }
    }

    // Let worlds and entities listen in any additional radiuses specified by the action
    this.additionalListenPoints.map(point => {
      this.addListener(point.world);
      point.world.getEntitiesWithinRadius(point.position, listenRadius).forEach(entity => {
        this.addListener(entity);
      });
    })

    // Add any additional listeners specified by the action
    this.additionalListeners.map(listener => this.addListener(listener));
  }

  permit({ priority = 0, by, using, message }: { priority?: number, by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    this.addPermission(true, { priority, by, using, message });
  }

  deny({ priority = 0, by, using, message }: { priority?: number, by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
    this.addPermission(false, { priority, by, using, message });
  }

  deniedByDefault() {
    this.deny();
    return this;
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

  tag(tag: string) {
    if(!this.metadata.has(tag)) {
      this.metadata.set(tag, true);
    }
  }

  untag(tag: string) {
    this.metadata.delete(tag);
  }

  tagged(tag: string): boolean {
    return this.metadata.has(tag);
  }

  sense(entity: Entity, information: SensoryInformation | boolean) {
    
  }

  counter(action: Action): boolean {
    action.nested = this.nested + 1;
    if (action.nested < 10) {
      return action.execute();
    }
    return false;
  }

  react(action: Action): boolean {
    this.reactions.push(action);
    action.nested = this.nested + 1;
    if (action.nested < 10) {
      this.reactions.push(action);
      return action.execute();
    }
    // TODO figure out logging / errors, then throw one for reactions that are obviously cyclicle
    return false;
  }

  followup(o: Action | Event): void {
    this.followups.push(o);
    Chaos.actionQueue.enqueue(o);
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
    const caster: Entity | undefined = json.caster ? Chaos.getEntity(json.caster) : undefined;
    const target: Entity | undefined = json.target ? Chaos.getEntity(json.target) : undefined;
    const using: Entity | undefined = json.using ? Chaos.getEntity(json.using) : undefined;
    const metadata = json.metadata;
    const permitted = json.permitted;
    return { caster, target, using, metadata, permitted };
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

  serialize(): Action.Serialized {
    return {
      caster: this.caster?.id,
      target: this.target?.id,
      using: this.using?.id,
      // tags: Array.from(this.tags),
      permitted: this.permitted,
      actionType: this.actionType
    };
  }

  generateMessage(): void {
    // Run the callback to generate a message
    if(this.terminalMessage !== undefined && !(this.terminalMessage instanceof TerminalMessage)) {
      this.terminalMessage = this.terminalMessage(this);
    }
  };

  initialize(): void { };
  teardown(): void { };
}

// tslint:disable-next-line: no-namespace
export namespace Action {
  export interface Serialized {
    caster?: string,
    target?: string,
    using?: string,
    metadata?: {[key: string]: string | number | boolean | undefined}
    permitted: boolean,
    actionType: ActionType
  }

  export interface Deserialized {
    caster?: Entity,
    target?: Entity,
    using?: Entity,
    metadata?: {[key: string]: string | number | boolean | undefined}
    permitted: boolean
  }
}

export interface ActionParameters {
  caster?: Entity,
  using?: Entity | Component,
  metadata?: {[key: string]: string | number | boolean | undefined}
}