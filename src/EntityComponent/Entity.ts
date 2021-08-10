import { triggerAsyncId } from 'async_hooks';
import { v4 as uuid } from 'uuid';
import { Printable } from '../ClientServer/Terminal/Printable';
import { SensoryInformation } from '../Events/Interfaces';
import {
  Chaos, Vector, World,
  Component, ComponentContainer, Event, Action,
  Listener, Ability, Property, AttachComponentAction,
  ChangeWorldAction, MoveAction, RelativeMoveAction,
  PublishEntityAction, UnpublishEntityAction,
  AddSlotAction, RemoveSlotAction, AddPropertyAction,
  OptionalCastParameters, Grant, RemovePropertyAction, LearnAbilityAction,
  ForgetAbilityAction, EquipItemAction, Scope, SenseEntityAction, NestedMap, Team, Sensor
} from '../internal';
import { NestedChanges } from '../Util/NestedMap';
import { ComponentCatalog } from './ComponentCatalog';
import { isSensor } from './Interfaces';

export class Entity implements Listener, ComponentContainer, Printable {
  readonly id: string;
  name: string;
  metadata = new Map<string, string | number | boolean | undefined>();
  published = false;
  active = false;
  perceives = false;  // when assigned to a player/team it contributes to visibility
  omnipotent = false; // listens to every action in the game

  properties: Map<string, Property> = new Map<string, Property>();

  components: ComponentCatalog = new ComponentCatalog(this); // all components

  abilities: Map<string, Grant[]> = new Map<string, Grant[]>();

  owners = new Set<string>(); // players that can control this Entity
  teams: NestedMap<Team>; // teams that owning players belong to

  sensedEntities: NestedMap<Entity>;

  // Places for items to be equipped
  slots: Map<string, Entity | undefined> = new Map<string, Entity | undefined>();
  // TODO Inventory array -- places for items to be stored -- probably needs to be a class to store size info

  world?: World;
  position: Vector = new Vector(0, 0);

  // TODO art asset
  // TODO single char for display in leiu of art asset

  constructor({ id = uuid(), name = 'Unnamed Entity', metadata, active = false, omnipotent = false }: Entity.ConstructorParams = {}) { // TODO 
    this.id = id;
    this.name = name;
    this.active = active;
    this.omnipotent = omnipotent;
    // tslint:disable-next-line: forin
    for(const key in metadata) {
      this.metadata.set(key, metadata[key]);
    }
    this.teams = new NestedMap<Team>(this.id, 'entity');
    this.sensedEntities = new NestedMap<Entity>(id, 'entity');
  }

  isPublished(): boolean {
    return this.published;
  }

  print(): string {
    return this.name !== '' ? this.name : '???';
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
        return Chaos.reference;
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

  sense(action: Action): SensoryInformation | boolean {
    return this.components.sense(action);
  }

  getProperty(k: string): Property | undefined {
    return this.properties.get(k);
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
  cast(abilityName: string, {using, grantedBy, target, params}: OptionalCastParameters = {}): Event | string | undefined {
    // See if we have this ability at all
    const grants = this.abilities.get(abilityName);
    if(grants && grants.length > 0) {
      // Use the verion of this ability granted by 
      let grant: Grant | undefined = using ? grants.find(g => g.using === using && g.grantedBy === grantedBy) : undefined;
      if(!grant)
        grant = grants[0];
      const e = grant.ability.cast(this, { using, target, params });
      return e;
    }
    return undefined;
  }

  /*****************************************
   *  ACTION GENERATORS / IMPLEMENTATIONS
   *****************************************/

  getPublishedInPlaceAction(): PublishEntityAction {
    if(this.published && this.world !== undefined) {
      return new PublishEntityAction({entity: this, position: this.position, world: this.world});
    }
    throw new Error('Tried to publish an entity to a client is not published or does not have a world.');
  }

  // Publishing
  
  publish({caster, world, position, using, metadata}: PublishEntityAction.EntityParams): PublishEntityAction {
    return new PublishEntityAction({caster, target: this, entity: this, world, position, using, metadata});
  }

  _publish(world: World, position: Vector, preloaded = false): boolean {
    if(this.published) {
      return false;
    }
    this.published = true;
    this.position = position;
    world.addEntity(this, preloaded);
    this.world = world;
    Chaos.addEntity(this);
    this.components.publish();
    return true;
  }

  // Unpublishing

  unpublish({caster, target, using, metadata}: UnpublishEntityAction.EntityParams = {}): UnpublishEntityAction {
    return new UnpublishEntityAction({caster, target, entity: this, using, metadata});
  }

  _unpublish(): boolean {
    Chaos.removeEntity(this);
    this.components.unpublish();
    // TODO and persistence stuff
    this.published = false;
    return true;
  }

  // Attaching components

  attach({component, caster, using, metadata}: AttachComponentAction.EntityParams, force = false): AttachComponentAction {
    return new AttachComponentAction({ caster, target: this, component, using, metadata});
  }

  _attach(component: Component): boolean {
    this.components.addComponent(component); // TODO check for unique flag, return false if already attached
    if(isSensor(component)) {
      this.sensedEntities.addChild(component.sensedEntities);
    }
    return true;
  }

  // Adding properties

  addProperty({caster, using, name, current, min, max, metadata}: AddPropertyAction.EntityParams, force = false): AddPropertyAction {
    return new AddPropertyAction({ caster, target: this, using, name, current, min, max, metadata});
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

  removeProperty({caster, using, name, metadata}: RemovePropertyAction.EntityParams, force = false) {
    return new RemovePropertyAction({ caster, target: this, using, name, metadata});
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

  // Learning abilities

  learn({caster, using, ability, metadata}: LearnAbilityAction.EntityParams, force = false): LearnAbilityAction {
    return new LearnAbilityAction({caster, target: this, using, ability, metadata});
  }

  _learn(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean {
    const { name } = ability;
    const grants = this.abilities.get(name);
    if(grants) {
      // check if ability already granted by this combo
      const duplicate = grants.find(grant => grant.grantedBy === grantedBy && grant.using === using);
      if(!duplicate) {
        grants.push({ability, grantedBy: grantedBy?.id, using: using?.id });
      } else {
        return false;
      }
    } else {
      this.abilities.set(name, [{ability, grantedBy: grantedBy?.id, using: using?.id }]);
    }
    return true;
  }

  // Denying abilities

  forget({caster, using, ability, metadata}: ForgetAbilityAction.Params, force = false): ForgetAbilityAction {
    return new ForgetAbilityAction({caster, target: this, using, ability, metadata});
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

  equip({caster, slot, item, metadata }: EquipItemAction.EntityParams, force = false): EquipItemAction {
    return new EquipItemAction({caster, target: this, slot, item, metadata});
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

  addSlot({caster, name, metadata }: AddSlotAction.EntityParams, force = false): AddSlotAction {
    return new AddSlotAction({caster, target: this, name, metadata});
  }

  _addSlot(name: string): boolean {
    if(!this.slots.has(name)) {
      this.slots.set(name, undefined);
      return true;
    }
    return false;
  }

  removeSlot({caster, name, metadata }: RemoveSlotAction.Params, force = false): RemoveSlotAction {
    return new RemoveSlotAction({caster, target: this, name, metadata});
  }

  _removeSlot(name: string): boolean {
    if(this.slots.has(name)) {
      // TODO, have to drop item on the ground, or something
      this.slots.delete(name);
      return true;
    }
    return false;
  }

  // Movement

  move({caster, to, using, metadata}: MoveAction.EntityParams): MoveAction {
    return new MoveAction({caster, target: this, to, using, metadata});
  }

  moveRelative({caster, amount, using, metadata}: RelativeMoveAction.EntityParams): RelativeMoveAction {
    return new RelativeMoveAction({caster, target: this, amount, using, metadata});
  }

  _move(to: Vector): boolean {
    // Let the world know to to move to a different container if the destination is in a different chunk
    if (this.world && this.position.differentChunkFrom(to)) {
      this.world.moveEntity(this, this.position, to);
      // Let owning players or teams, if any, know for scope change.
      const { perceptionGrouping } = Chaos;
      if (perceptionGrouping === 'team') {
        // tslint:disable-next-line: forin
        for(let teamId in this.teams.map.entries) {
          const scope = Chaos.teams.get(teamId)!.scopesByWorld.get(this.world.id);
          if(scope) {
            // TODO SERIOUS optimization here -- no need to repeat so many calculations between 
            scope.addViewer(this.id, Chaos.viewDistance, to.toChunkSpace(), this.position.toChunkSpace());
            scope.removeViewer(this.id, Chaos.viewDistance, this.position.toChunkSpace(), to.toChunkSpace());
          }
        }
      } else {
        for(let playerId of this.owners) {
          const scope = Chaos.players.get(playerId)!.scopesByWorld.get(this.world.id);
          if(scope) {
            scope.addViewer(this.id, Chaos.viewDistance, to.toChunkSpace(), this.position.toChunkSpace());
            scope.removeViewer(this.id, Chaos.viewDistance, this.position.toChunkSpace(), to.toChunkSpace());
          }
        }
      }
    }
    // Make the move
    this.position = to;
    return true;
  }

  // Senses

  senseEntity({target, using, metadata}: SenseEntityAction.EntityParams): SenseEntityAction {
    return new SenseEntityAction({caster: this, target, using, metadata});
  }

  _senseEntity(entity: Entity, using: Sensor): NestedChanges {
    return using.sensedEntities.add(entity.id, entity);
  }

  loseEntity({target, using, metadata}: SenseEntityAction.EntityParams): SenseEntityAction {
    return new SenseEntityAction({caster: this, target, using, metadata});
  }

  _loseEntity(entity: Entity, from: Sensor): NestedChanges {
    return from.sensedEntities.remove(entity.id);
  }

  // World
  
  changeWorlds({caster, from, to, position, using, metadata}: ChangeWorldAction.EntityParams): ChangeWorldAction {
    return new ChangeWorldAction({caster, target: this, from, to, position, using, metadata});
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
      active: this.active,
      omnipotent: this.omnipotent,
      components
    };
  }

}

// tslint:disable-next-line: no-namespace
export namespace Entity {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    metadata?: {[key: string]: string | number | boolean | undefined},
    active?: boolean,
    omnipotent?: boolean
  }

  export interface Serialized {

  }

  export interface SerializedForClient {
    id: string,
    name: string,
    world?: string,
    metadata?: {[key: string]: string | number | boolean | undefined},
    active?: boolean,
    omnipotent?: boolean,
    components?: Component.SerializedForClient[]
  }

  export function Deserialize(json: Entity.Serialized): Entity {
    throw new Error();
  }

  export function DeserializeAsClient(json: Entity.SerializedForClient): Entity {
    try {
      const { id, name, metadata, active, omnipotent, components, world: worldId } = json;
      const deserialized = new Entity({ id, name, metadata, active, omnipotent });
      if(worldId !== undefined) {
        const world = Chaos.getWorld(worldId);
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
