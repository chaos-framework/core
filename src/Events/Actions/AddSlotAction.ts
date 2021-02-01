import { Action, ActionParameters, IEntity } from '../../internal';

export class AddSlotAction extends Action {
  name: string;
  target: IEntity;

  constructor({caster, target, using, name, tags = []}: AddSlotAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._addSlot(this.name);
  }
}

export namespace AddSlotAction {
  export interface EntityParams extends ActionParameters {
    name: string,
  }

  export interface Params extends EntityParams {
    target: IEntity;
  }
}
