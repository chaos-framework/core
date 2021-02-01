import { Action, ActionParameters, IEntity } from '../../internal'; 

export class EquipItemAction extends Action {
  slot: string;
  target: IEntity;
  item: IEntity;
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
    item: IEntity
  }

  export interface Params extends EntityParams {
    target: IEntity;
  }
}
