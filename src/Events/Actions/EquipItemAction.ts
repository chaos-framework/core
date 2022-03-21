import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator
} from '../../internal.js';

export class EquipItemAction extends Action<Entity> {
  actionType: ActionType = ActionType.EQUIP_ITEM_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  slot: string;
  target: Entity;
  item: Entity;
  permitted = false; // assume canceled until something allows it

  constructor({ caster, target, slot, item, using, metadata }: EquipItemAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.slot = slot;
    this.item = item;
    // Equipping is forbidden by default, until allowed by another component
    this.addPermission(false);
  }

  async *apply(): ProcessEffectGenerator {
    return this.target._equip(this.item, this.slot);
  }
}

export namespace EquipItemAction {
  export interface EntityParams extends ActionParameters<Entity> {
    slot: string;
    item: Entity;
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
