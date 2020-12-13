import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";

export class EquipAction extends Action {
  slot: string;
  target: Entity;
  item: Entity;
  permitted = false; // assume canceled until something allows it

  constructor({caster, target, slot, item, using, tags = []}: EquipAction.Params) {
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

export namespace EquipAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    slot: string,
    item: Entity
  }
}
