import { Action, ActionParameters, Entity, MessageType } from '../../internal';

export class AddSlotAction extends Action {
  messageType = MessageType.ADD_SLOT_ACTION;

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

export namespace AddSlotAction {
  export interface EntityParams extends ActionParameters {
    name: string,
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
