import { Action, ActionParameters, Entity, MessageType } from '../../internal'; 

export class EquipItemAction extends Action {
  messageType: MessageType = MessageType.EQUIP_ITEM_ACTION;

  slot: string;
  target: Entity;
  item: Entity;
  permitted = false; // assume canceled until something allows it

  constructor({caster, target, slot, item, using, tags = []}: EquipItemAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.slot = slot;
    this.item = item;
    // Equipping is forbidden by default, until allowed by another component
    this.permit();
  }

  apply(): boolean {
    return this.target._equip(this.item, this.slot);
  }
}

export namespace EquipItemAction {
  export interface EntityParams extends ActionParameters {
    slot: string,
    item: Entity
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
