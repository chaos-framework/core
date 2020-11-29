import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";

export class AddSlotAction extends Action {
  name: string;
  target: Entity;

  constructor({caster, target, using, name, tags = []}: SlotActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._addSlot(this.name);
  }
}

export class RemoveSlotAction extends Action {
  name: string;
  target: Entity;

  constructor({caster, target, using, name, tags = []}: SlotActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._removeSlot(this.name);
  }
}

export interface SlotActionParameters extends SlotActionEntityParameters {
  target: Entity;
}

export interface SlotActionEntityParameters extends ActionParameters {
  name: string,
}
