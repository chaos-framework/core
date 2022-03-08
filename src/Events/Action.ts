import {
  Chaos,
  ActionType,
  Entity,
  Component,
  Event,
  ComponentContainer,
  BroadcastType,
  World,
  Permission,
  SensoryInformation,
  NestedChanges,
  Viewer,
  Vector,
  Printable,
  TerminalMessageFragment,
  TerminalMessage,
  NestedSetChanges,
  Followup,
  processRunner,
  Effect,
  EffectGenerator,
  EffectRunner,
  Immediate,
  ProcessEffectKey,
  Permit,
  Deny
} from '../internal.js';

export abstract class Action implements EffectRunner {
  actionType: ActionType = ActionType.INVALID;
  broadcastType: BroadcastType = BroadcastType.FULL;

  terminalMessage?: TerminalMessage | ((action: Action) => TerminalMessage);
  generatedMessage?: TerminalMessage;
  verb?: string;

  caster?: Entity;
  target?: Entity;
  using?: Entity | Component;

  metadata = new Map<string, string | number | boolean | undefined>();
  breadcrumbs: Set<string> = new Set<string>();

  public: boolean = false; // whether or not nearby entities (who are not omnipotent) can modify/react

  skipPrePhases: boolean = false; // whether or not to run pre-phases
  skipPostPhases: boolean = false; // whether or not to run post-phases

  permissions: Map<number, Permission> = new Map<number, Permission>();
  permitted: boolean = true;
  applied: boolean = false;
  decidingPermission?: Permission;

  nested: number = 0;

  movementAction: boolean = false; // whether the action involves movement, and therefore possible scope / visibility change

  anticipators = new Set<string>();
  sensors = new Map<string, SensoryInformation | boolean>();

  entityVisibilityChanges?: NestedChanges;
  chunkVisibilityChanges?: NestedSetChanges;

  listeners = new Map<string, ComponentContainer>();

  // Additional worlds and points that entities in a radius around can be included.
  additionalListenPoints: { world: World; position: Vector }[] = [];
  // Additional listeners on top of the default caster -> target flow
  additionalListeners: ComponentContainer[] = [];

  followups: (Action | Event)[] = [];
  reactions: (Action | Event)[] = [];
  previous?: {
    action: Action;
    effectType: ProcessEffectKey;
  };

  // Function to run to check if the action is still feasible after any modifiers / counters etc
  feasabilityCallback?: (a?: Action) => boolean;

  static universallyRequiredFields: string[] = ['tags', 'breadcrumbs', 'permitted'];

  constructor({ caster, using, metadata }: ActionParameters = {}) {
    this.caster = caster;
    this.using = using;
    this.permissions.set(0, new Permission(true));
    // tslint:disable-next-line: forin
    for (const key in metadata) {
      this.metadata.set(key, metadata[key]);
    }
  }

  // Upon execution this action will apply itself and broadcast -- no phases called
  direct(): Action {
    this.skipPrePhases = true;
    this.skipPostPhases = true;
    return this;
  }

  // Set the optional callback to see if the action is still possible
  if(callback: (a?: Action) => boolean): Action {
    this.feasabilityCallback = callback;
    return this;
  }

  withMessage(...items: (string | Printable | TerminalMessageFragment | undefined)[]) {
    this.terminalMessage = new TerminalMessage(...items);
    return this;
  }

  *run(force: boolean = false): EffectGenerator {
    this.initialize();

    // Get listeners (nearby entities, worlds, systems, etc)
    this.collectListeners();

    // Assume that caster has full awareness
    if (this.caster) {
      this.sensors.set(this.caster.id, true);
    }

    // Handle all pre-phases
    if (!this.skipPrePhases) {
      for (const phase of Chaos.getPrePhases()) {
        for (const [, listener] of this.listeners) {
          listener.handle(phase, this);
        }
      }
    }

    // See if the action is allowed after any modifiers
    this.decidePermission();

    // Apply this action to the target, checking for permission and if still feasible
    if (
      (this.permitted && this.feasabilityCallback !== undefined
        ? this.feasabilityCallback(this)
        : true) ||
      force
    ) {
      const generator = this.apply();
      let res = generator.next();
      while (!res.done) {
        yield res.value;
        res = generator.next();
      }
      this.applied = res.value;
    }

    // Generate terminal message
    this.generateMessage();

    // Handle all post-phases
    if (!this.skipPostPhases) {
      for (const phase of Chaos.getPostPhases()) {
        for (const [, listener] of this.listeners) {
          listener.handle(phase, this);
        }
      }
    }

    this.teardown();

    return this.applied;
  }

  // Runs this action internally, without broadcasting to any clients. Useful for entity factories or game initialization.
  async runPrivate() {
    await processRunner(this, false);
  }

  // Runs processEffect on all yielded results of this action
  *process(): EffectGenerator {
    const generator = this.apply();
    let next = generator.next();
    // Handle
    while (next.done === false) {
      const effect = next.value;
      const result = this.processEffect(effect);
      next = generator.next();
    }
  }

  /**
   * Logic for effect handling within actions. Handles permission effects by default, but can be
   * overriden for custom action-specific effects. Just make sure to return `super(effect)` at the end
   * if the override doesn't actually handle the effect passed in.
   */
  processEffect(effect: Effect): Effect | undefined {
    const [effectType] = effect;
    switch (effectType) {
      case 'PERMIT':
        this.addPermission(true, effect[1]);
        break;
      case 'DENY':
        this.addPermission(false, effect[1]);
        break;
      default:
        return undefined;
    }
  }

  addListener(listener: ComponentContainer) {
    if (!this.listeners.has(listener.id)) {
      this.listeners.set(listener.id, listener);
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
        caster.world.getEntitiesWithinRadius(caster.position, listenRadius).map((entity) => {
          if (entity.id !== caster.id && entity.id !== target?.id) {
            this.addListener(entity);
          }
        });
        this.addListener(caster.world);
      }

      // Add all players that own this entity
      for (const [, player] of caster.players) {
        this.addListener(player);
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
    if (target !== undefined && target !== caster) {
      if (target.world !== undefined) {
        this.addListener(target.world);
        target.world.getEntitiesWithinRadius(target.position, listenRadius).forEach((entity) => {
          this.addListener(entity);
        });
      }
      this.addListener(target);

      // Add all players that own this entity
      for (const [, player] of target.players) {
        this.addListener(player);
      }

      // Add all teams that this entity belongs to
      if (target.team !== undefined) {
        this.addListener(target.team);
      }
    }

    // Let worlds and entities listen in any additional radiuses specified by the action
    this.additionalListenPoints.map((point) => {
      this.addListener(point.world);
      point.world.getEntitiesWithinRadius(point.position, listenRadius).forEach((entity) => {
        this.addListener(entity);
      });
    });

    // Add any additional listeners specified by the action
    this.additionalListeners.map((listener) => this.addListener(listener));
  }

  deniedByDefault() {
    this.addPermission(false);
    return this;
  }

  addPermission(
    permitted: boolean,
    {
      priority = 0,
      by,
      using,
      message
    }: {
      priority?: number;
      by?: Entity | Component;
      using?: Entity | Component;
      message?: string;
    } = {}
  ) {
    const previous = this.permissions.get(priority);
    if (previous === undefined) {
      // Add directly if this has never been added
      this.permissions.set(priority, new Permission(permitted, { by, using, message }));
    } else {
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
    if (!this.metadata.has(tag)) {
      this.metadata.set(tag, true);
    }
  }

  untag(tag: string) {
    this.metadata.delete(tag);
  }

  tagged(tag: string): boolean {
    return this.metadata.has(tag);
  }

  sense(entity: Entity, information: SensoryInformation | boolean) {}

  static immediate(action: Action): Immediate {
    return ['IMMEDIATE', action];
  }

  react(action: Action): Immediate {
    action.previous = {
      action: this,
      effectType: 'IMMEDIATE'
    };
    return ['IMMEDIATE', action];
  }

  followup(item: Action | Event): Followup {
    item.previous = {
      action: this,
      effectType: 'FOLLOWUP'
    };
    return ['FOLLOWUP', item];
  }

  permit(priority: number, args: Omit<Permit[1], 'priority'>): Permit {
    return ['PERMIT', { ...args, priority }];
  }

  deny(priority: number, args: Omit<Permit[1], 'priority'>): Deny {
    return ['DENY', { ...args, priority }];
  }

  asEffect(): Immediate {
    return ['IMMEDIATE', this];
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

  abstract apply(): Generator<Effect, boolean>;

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    return true; // SCOPE
  }

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
    if (this.terminalMessage !== undefined) {
      if (!(this.terminalMessage instanceof TerminalMessage)) {
        this.terminalMessage = this.terminalMessage(this);
      }
      this.generatedMessage = this.terminalMessage;
    }
  }

  initialize(): void {}
  teardown(): void {}
}

// tslint:disable-next-line: no-namespace
export namespace Action {
  export interface Serialized {
    caster?: string;
    target?: string;
    using?: string;
    metadata?: { [key: string]: string | number | boolean | undefined };
    permitted: boolean;
    actionType: ActionType;
  }

  export interface Deserialized {
    caster?: Entity;
    target?: Entity;
    using?: Entity;
    metadata?: { [key: string]: string | number | boolean | undefined };
    permitted: boolean;
  }
}

export interface ActionParameters {
  caster?: Entity;
  using?: Entity | Component;
  metadata?: { [key: string]: string | number | boolean | undefined };
}
