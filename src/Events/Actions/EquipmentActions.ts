import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";

export default class EquipAction extends Action {
  slot: string;
  target: Entity;
  item: Entity;
  permitted = false; // assume canceled until something allows it

  constructor({caster, target, slot, item, tags = []}: EquipActionParameters) {
    super({caster, tags});
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

export interface EquipActionParameters extends ActionParameters {
  target: Entity;
  slot: string,
  item: Entity
}

export interface EquipActionEntityParameters extends ActionParameters {
  slot: string,
  item: Entity
}
