import { Action, ActionParameters, Entity } from '../../internal';

export class AddSlotAction extends Action {
  name: string;
  target: Entity;

  constructor({caster, target, using, name, tags = []}: AddSlotAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._addSlot(this.name);
  }
}

namespace AddSlotAction {
  export interface EntityParams extends ActionParameters {
    name: string,
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
