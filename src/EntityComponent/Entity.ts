import { v4 as uuid } from 'uuid';
import {
  Game, Vector, World,
  Component, ComponentContainer, Event, Action,
  Listener, Modifier, Reacter, isModifier, isReacter,
  Ability, Property, AttachComponentAction,
  ChangeWorldAction, MoveAction, RelativeMoveAction,
  PublishEntityAction,
  AddSlotAction, RemoveSlotAction, AddPropertyAction,
  OptionalCastParameters, Grant, RemovePropertyAction, LearnAbilityAction, ForgetAbilityAction, EquipItemAction
} from '../internal';

export default class Entity implements Listener, ComponentContainer {
  id: string;
  tags = new Set<string>();
  private published = false;
  active = false;
  omnipotent = false; // listens to every action in the game

  properties: Map<string, Property> = new Map<string, Property>();

  components: Component[] = []; // all components
  modifiers: Modifier[] = [];   // all modifiers
  reacters: Reacter[] = [];     // all reacters

  abilities: Map<string, Grant[]> = new Map<string, Grant[]>();

  owners = new Set<string>(); // players that can control this Entity
  teams = new Set<string>(); // teams that owning players belong to

  // Places for items to be equipped
  slots: Map<string, Entity | undefined> = new Map<string, Entity | undefined>();
  // TODO Inventory array -- places for items to be stored -- probably needs to be a class to store size info

  world?: World;
  position: Vector = new Vector(0, 0);

  map: any;
  container: any; // TODO can this be combined with map?

  // TODO art asset
  // TODO single char for display in leiu of art asset

  constructor(active = false) {
    this.id = uuid();
    this.active = active;
    // TODO create from serialized to load from disk/db, and don't increment Entity count
  }

  isPublished(): boolean {
    return this.published;
  }

  activate() {
    this.active = true;
    // TODO attach listeners?
  }

  deactivate() {
    this.active = false;
    // TODO remove listeners?
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

  getProperty(k: string): Property | undefined {
    return this.properties.get(k);
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
      // TODO remove listeners on Entity and others
      return true;
    }
    else {
      // TODO handle error
      return false;
    }
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
      // e.execute();
      return e;
    }
    return undefined;
  }

  // Connect components which may have higher-order listeners upon publishing
  connectToWorld() {
    if(!this.isPublished() || ! this.world) {
      return;
    }
    const components = this.components;  // TODO also grab stored / equipped items and their listeners?
    for(let i = 0; i < components.length; i++) {
      const component = components[i];
      if(component.scope === "World") {
        if(isModifier(component)) {
          this.world.modifiers.push(component);
          const index = this.modifiers.indexOf(component);
          if(index != undefined) {
            this.modifiers.splice(this.modifiers.indexOf(component), 1);
          }
        }
        if(isReacter(component)) {
          this.world.reacters.push(component);
          const index = this.reacters.indexOf(component);
          if(index != undefined) {
            this.reacters.splice(this.reacters.indexOf(component), 1);
          }
        }
      }
    }
    // Also add this player tp any owning player(s) or team(s) scope for this world
    const game = Game.getInstance();
    const { perceptionGrouping } = game;
    if (perceptionGrouping === 'team') {
      for(let teamId of this.teams) {
        const scope = game.teams.get(teamId)!.scopesByWorld.get(this.world.id);
        if(scope) {
          // TODO SERIOUS optimization here -- no need to repeat so many calculations between 
          scope.addViewer(this.id, game.viewDistance, this.position.toChunkSpace());
        }
      }
    } else {
      for(let playerId of this.owners) {
        const scope = game.teams.get(playerId)!.scopesByWorld.get(this.world.id);
        if(scope) {
          scope.addViewer(this.id, game.viewDistance, this.position.toChunkSpace());
        }
      }
    }
  }

  // Disconnects world-level component listeners and adjusts scope of player or teams
  disconnectFromWorld() {
    if(!this.isPublished() || ! this.world) {
      return;
    }
    const components = this.components;  // TODO also grab stored / equipped items and their listeners?
    for(let i = 0; i < components.length; i++) {
      const component = components[i];
      if(component.scope === "World") {
        if(isModifier(component)) {
          const index = this.world.modifiers.indexOf(component);
          if(index){ 
            this.world.modifiers.splice(index, 1);
          }
        }
        if(isReacter(component)) {
          const index = this.world.reacters.indexOf(component);
          if(index){ 
            this.world.reacters.splice(index, 1);
          }
        }
      }  
    }
    // Also remove this player from owning player(s) or team(s) scope for this world
    const game = Game.getInstance();
    const { perceptionGrouping } = game;
    if (perceptionGrouping === 'team') {
      for(let teamId of this.teams) {
        const scope = game.teams.get(teamId)!.scopesByWorld.get(this.world.id);
        if(scope) {
          // TODO SERIOUS optimization here -- no need to repeat so many calculations between 
          scope.removeViewer(this.id, game.viewDistance, this.position.toChunkSpace());
        }
      }
    } else {
      for(let playerId of this.owners) {
        const scope = game.teams.get(playerId)!.scopesByWorld.get(this.world.id);
        if(scope) {
          scope.removeViewer(this.id, game.viewDistance, this.position.toChunkSpace());
        }
      }
    }
  }

  // Disconnects game-level component listeners
  disconnectFromGame() {}

  /*****************************************
   *  ACTION GENERATORS / IMPLEMENTATIONS
   *****************************************/

  // Publishing
  
  publish({caster, target, world, position, using, tags}: PublishEntityAction.Params): PublishEntityAction {
    return new PublishEntityAction({caster, target, entity: this, world, position, using, tags});
  }

  _publish(world: World, position: Vector, preloaded = false): boolean {
    if(this.published) {
      return false;
    }
    this.published = true;
    this.position = position;
    world.addEntity(this, preloaded);
    this.world = world;
    this.connectToWorld();
    Game.getInstance().addEntity(this);
    return true;
  }

  // Attaching components

  attach({component, caster, using, tags}: AttachComponentAction.EntityParams, force = false): AttachComponentAction {
    return new AttachComponentAction({ caster, target: this, component, using, tags});
  };

  _attach(component: Component): boolean {
    this.components.push(component); // TODO check for unique flag, return false if already attached
    // Add all listeners as local
    // switch(component.scope) {
    //   case "Game":
    //     break;
    if(isModifier(component)) {
      this.modifiers.push(component);
    }
    if(isReacter(component)) {
      this.reacters.push(component);
    }
    component.attach(this);
    return true;
  }

  // Adding properties

  addProperty({caster, using, name, current, min, max, tags}: AddPropertyAction.EntityParams, force = false): AddPropertyAction {
    return new AddPropertyAction({ caster, target: this, using, name, current, min, max, tags});
  }

  _addProperty(name: string, current?: number, min?: number, max?: number): boolean {
    // Check that we don't already have this property
    if(this.properties.has(name)) {
      return false;
    }
    else {
      this.properties.set(name, new Property(this, name, current, min, max));
      return true;
    }
  }

  removeProperty({caster, using, name, tags}: RemovePropertyAction.EntityParams, force = false) {
    return new RemovePropertyAction({ caster, target: this, using, name, tags});
  }

  _removeProperty(name: string, p?: Property): boolean {
    // Check that we have this property
    if(!this.properties.has(name)) {
      return false;
    }
    else {
      this.properties.delete(name);
      // TODO unhook modifications on property values
      return true;
    }
  }

  // Granting abilities

  learn({caster, using, ability, tags}: LearnAbilityAction.EntityParams, force = false): LearnAbilityAction {
    return new LearnAbilityAction({caster, target: this, using, ability, tags});
  }

  _learn(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
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

  forget({caster, using, ability, tags}: ForgetAbilityAction.Params, force = false): ForgetAbilityAction {
    return new ForgetAbilityAction({caster, target: this, using, ability, tags});
  }

  _forget(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
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

  equip({caster, slot, item, tags = []}: EquipItemAction.EntityParams, force = false): EquipItemAction {
    return new EquipItemAction({caster, target: this, slot, item, tags});
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

  addSlot({caster, name, tags = []}: AddSlotAction.EntityParams, force = false): AddSlotAction {
    return new AddSlotAction({caster, target: this, name, tags});
  }

  _addSlot(name: string): boolean {
    if(!this.slots.has(name)) {
      this.slots.set(name, undefined);
      return true;
    }
    return false;
  }

  removeSlot({caster, name, tags = []}: RemoveSlotAction.Params, force = false): RemoveSlotAction {
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

  move({caster, to, using, tags}: MoveAction.EntityParams): MoveAction {
    return new MoveAction({caster, target: this, to, using, tags});
  }

  moveRelative({caster, amount, using, tags}: RelativeMoveAction.EntityParams): RelativeMoveAction {
    return new RelativeMoveAction({caster, target: this, amount, using, tags});
  }

  _move(to: Vector): boolean {
    // Let the world know to to move to a different container if the destination is in a different chunk
    if (this.world && this.position.differentChunkFrom(to)) {
      this.world.moveEntity(this, this.position, to);
      // Let owning players or teams, if any, know for scope change.
      const game = Game.getInstance();
      const { perceptionGrouping } = game;
      if (perceptionGrouping === 'team') {
        for(let teamId of this.teams) {
          const scope = game.teams.get(teamId)!.scopesByWorld.get(this.world.id);
          if(scope) {
            // TODO SERIOUS optimization here -- no need to repeat so many calculations between 
            scope.addViewer(this.id, game.viewDistance, to.toChunkSpace(), this.position.toChunkSpace());
            scope.removeViewer(this.id, game.viewDistance, this.position.toChunkSpace(), to.toChunkSpace());
          }
        }
      } else {
        for(let playerId of this.owners) {
          const scope = game.players.get(playerId)!.scopesByWorld.get(this.world.id);
          if(scope) {
            scope.addViewer(this.id, game.viewDistance, to.toChunkSpace(), this.position.toChunkSpace());
            scope.removeViewer(this.id, game.viewDistance, this.position.toChunkSpace(), to.toChunkSpace());
          }
        }
      }
    }
    // Make the move
    this.position = to;
    return true;
  }
  
  changeWorlds({caster, from, to, position, using, tags}: ChangeWorldAction.EntityParams): ChangeWorldAction {
    return new ChangeWorldAction({caster, target: this, from, to, position, using, tags});
  }

  _changeWorlds(to: World, position: Vector): boolean {
    if(this.world) {
      this.disconnectFromWorld();
    }
    this.world = to;
    this.connectToWorld();
    return true;
  }

}
