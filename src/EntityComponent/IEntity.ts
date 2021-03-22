import { Component, Property, Event, Modifier, Reacter, Grant, Vector, Action, OptionalCastParameters, PublishEntityAction, AttachComponentAction, AddPropertyAction, RemovePropertyAction, Ability, ForgetAbilityAction, LearnAbilityAction, EquipItemAction, AddSlotAction, ChangeWorldAction, MoveAction, RelativeMoveAction, RemoveSlotAction, World, Entity, ComponentCatalog } from "../internal";

export default interface Entity {
  id: string;
  name: string;
  published: boolean;
  omnipotent: boolean;
  tags: Set<string>;
  active: boolean;
  perceives: boolean;
  properties: Map<string, Property>;
  components: ComponentCatalog;
  modifiers: Modifier[];
  reacters: Reacter[];
  abilities: Map<string, Grant[]>;
  owners: Set<string>;
  teams: Set<string>;
  slots: Map<string, Entity | undefined>;
  world?: World;
  position: Vector;
  map: any;
  container: any;
  isPublished(): boolean;
  activate(): void;
  deactivate(): void;
  modify(a: Action): void;
  _modify(a: Action): void;
  react(a: Action): void;
  _react(a: Action): void;
  getProperty(k: string): Property | undefined;
  tag(tag: string): void;
  untag(tag: string): void;
  tagged(tag: string): boolean;
  is(component: string | Component): Component | undefined;
  has(component: string | Component): Component | undefined;
  can(ability: string): boolean;
  detach(component: Component): boolean;
  cast(abilityName: string, {using, target, options}: OptionalCastParameters): Event | undefined;
  connectToWorld(): void;
  disconnectFromWorld(): void;
  disconnectFromGame(): void;
  publish({caster, target, world, position, using, tags}: PublishEntityAction.Params): PublishEntityAction
  _publish(world: World, position: Vector, preloaded: boolean): boolean;
  _unpublish(): boolean;
  attach({component, caster, using, tags}: AttachComponentAction.EntityParams, force?: boolean): AttachComponentAction
  _attach(component: Component): boolean;
  addProperty({caster, using, name, current, min, max, tags}: AddPropertyAction.EntityParams, force?: boolean): AddPropertyAction;
  _addProperty(name: string, current?: number, min?: number, max?: number): boolean;
  removeProperty({caster, using, name, tags}: RemovePropertyAction.EntityParams, force?: boolean): RemovePropertyAction;
  _removeProperty(name: string, p?: Property): boolean;
  learn({caster, using, ability, tags}: LearnAbilityAction.EntityParams, force?: boolean): LearnAbilityAction;
  _learn(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean;
  forget({caster, using, ability, tags}: ForgetAbilityAction.Params, force?: boolean): ForgetAbilityAction;
  _forget(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component): boolean;
  equip({caster, slot, item, tags}: EquipItemAction.EntityParams, force?: boolean): EquipItemAction;
  _equip(item: Entity, slotName: string): boolean;
  addSlot({caster, name, tags}: AddSlotAction.EntityParams, force?: boolean): AddSlotAction;
  _addSlot(name: string): boolean;
  removeSlot({caster, name, tags}: RemoveSlotAction.Params, force?: boolean): RemoveSlotAction
  _removeSlot(name: string): boolean
  move({caster, to, using, tags}: MoveAction.EntityParams): MoveAction
  moveRelative({caster, amount, using, tags}: RelativeMoveAction.EntityParams): RelativeMoveAction
  _move(to: Vector): boolean;
  changeWorlds({caster, from, to, position, using, tags}: ChangeWorldAction.EntityParams): ChangeWorldAction;
  _changeWorlds(to: World, position: Vector): boolean;
  serialize(): Entity.Serialized;
  serializeForClient(): Entity.SerializedForClient;
}
