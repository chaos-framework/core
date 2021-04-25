import { v4 as uuid } from 'uuid';
import {
  Game, Vector, World,
  Component, ComponentContainer, Event, Action,
  Listener, Modifier, Reacter, isModifier, isReacter,
  Ability, Property, AttachComponentAction,
  ChangeWorldAction, MoveAction, RelativeMoveAction,
  PublishEntityAction,
  AddSlotAction, RemoveSlotAction, AddPropertyAction,
  OptionalCastParameters, Grant, RemovePropertyAction, LearnAbilityAction, ForgetAbilityAction, EquipItemAction, Scope
} from '../internal';
import { ComponentCatalog } from './ComponentCatalog';

export class Entity implements Listener, ComponentContainer {
  id: string;
  name: string;
  tags = new Set<string>();
  published = false;
  active = false;
  perceives = false;  // when assigned to a player/team it contributes to visibility
  omnipotent = false; // listens to every action in the game

  properties: Map<string, Property> = new Map<string, Property>();

  components: ComponentCatalog = new ComponentCatalog(this); // all components

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

  constructor({ id = uuid(), name = 'Unnamed Entity', tags = [], active = false, omnipotent = false }: Entity.ConstructorParams = {}) { // TODO 
    this.id = id;
    this.name = name;
    this.active = active;
    this.omnipotent = omnipotent;
    this.tags = new Set<string>(tags);
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

  // MESSAGING

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
    switch(scope) {
      case 'entity':
        return this;
      case 'world':
        return this.world;
      case 'game':
        return Game.getInstance();
      default:
        return undefined;
    }
  }

  modify(action: Action) {
    this.components.modify(action);
  }
  
  react(action: Action) {
    this.components.react(action);
  }

  senseAction(a: Action): object | undefined {
    return;
  }

  senseEntity(e: Entity): object | undefined {
    return;
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

  is(componentName: string): Component | undefined  {
    return this.components.is(componentName);
  }

  has(componentName: string): Component | undefined {
    return this.components.has(componentName);
  }

  // TODO "all" method to get all components of a type

  can(ability: string): boolean {
    return this.abilities.has(ability);
  }

  detach(component: Component) {
    return this.components.removeComponent(component);
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
  // connectToWorld() {
  //   if(!this.isPublished() || !this.world) {
  //     return;
  //   }
  //   // Add this player tp any owning player(s) or team(s) scope for this world
  //   const game = Game.getInstance();
  //   const { perceptionGrouping } = game;
  //   if (perceptionGrouping === 'team') {
  //     for(let teamId of this.teams) {
  //       const scope = game.teams.get(teamId)!.scopesByWorld.get(this.world.id);
  //       if(scope) {
  //         // TODO SERIOUS optimization here -- no need to repeat so many calculations between 
  //         scope.addViewer(this.id, game.viewDistance, this.position.toChunkSpace());
  //       }
  //     }
  //   } else {
  //     for(let playerId of this.owners) {
  //       const scope = game.teams.get(playerId)!.scopesByWorld.get(this.world.id);
  //       if(scope) {
  //         scope.addViewer(this.id, game.viewDistance, this.position.toChunkSpace());
  //       }
  //     }
  //   }
  // }

  // Disconnects world-level component listeners and adjusts scope of player or teams
  // disconnectFromWorld() {
  //   if(!this.isPublished() || ! this.world) {
  //     return;
  //   }
  //   // Remove this player from owning player(s) or team(s) scope for this world
  //   const game = Game.getInstance();
  //   const { perceptionGrouping } = game;
  //   if (perceptionGrouping === 'team') {
  //     for(let teamId of this.teams) {
  //       const scope = game.teams.get(teamId)!.scopesByWorld.get(this.world.id);
  //       if(scope) {
  //         // TODO SERIOUS optimization here -- no need to repeat so many calculations between 
  //         scope.removeViewer(this.id, game.viewDistance, this.position.toChunkSpace());
  //       }
  //     }
  //   } else {
  //     for(let playerId of this.owners) {
  //       const scope = game.teams.get(playerId)!.scopesByWorld.get(this.world.id);
  //       if(scope) {
  //         scope.removeViewer(this.id, game.viewDistance, this.position.toChunkSpace());
  //       }
  //     }
  //   }
  // }

  // // Disconnects game-level component listeners
  // disconnectFromGame() {}

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
    Game.getInstance().addEntity(this);
    this.components.publish();
    return true;
  }

  // Unpublishing

  _unpublish(): boolean {
    Game.getInstance().removeEntity(this);
    this.components.unpublish();
    // TODO and persistence stuff
    this.published = false;
    return true;
  }

  // Attaching components

  attach({component, caster, using, tags}: AttachComponentAction.EntityParams, force = false): AttachComponentAction {
    return new AttachComponentAction({ caster, target: this, component, using, tags});
  }

  _attach(component: Component): boolean {
    this.components.addComponent(component); // TODO check for unique flag, return false if already attached
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
    this.world = to;
    // TODO component catalog callback
    return true;
  }

  serialize(): Entity.Serialized {
      return { id: this.id };
  }

  serializeForClient(): Entity.SerializedForClient {
    const components: Component.SerializedForClient[] = [];
    this.components.all.forEach(c => { 
      if(c.broadcast) {
        components.push(c.serializeForClient());
      }
    });
    return { 
      id: this.id,
      name: this.name,
      tags: Array.from(this.tags.values()),
      active: this.active,
      omnipotent: this.omnipotent,
      components
    };
  }

}

export namespace Entity {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    tags?: string[],
    active?: boolean,
    omnipotent?: boolean
  }

  export interface Serialized {

  }
  
  export interface SerializedForClient {
    id: string,
    name: string,
    world?: string,
    tags?: string[],
    active?: boolean,
    omnipotent?: boolean,
    components?: Component.SerializedForClient[]
  }

  export function Deserialize(json: Entity.Serialized): Entity {
    throw new Error();
  }

  export function DeserializeAsClient(json: Entity.SerializedForClient): Entity {
    try {
      const { id, name, tags, active, omnipotent, components, world: worldId } = json;
      const deserialized = new Entity({ id, name, tags, active, omnipotent });
      if(worldId !== undefined) {
        const world = Game.getInstance().getWorld(worldId);
        if(world !== undefined) {
          deserialized.world = world;
        }
      }
      if(components) {
        for(let c of components) {
          deserialized._attach(Component.DeserializeAsClient(c));
        }
      }
      return deserialized;
    } catch (error) {
      throw new Error();
    }
  }
}
