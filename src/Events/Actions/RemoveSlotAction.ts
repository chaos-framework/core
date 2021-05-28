import { Action, ActionParameters, Entity, MessageType } from '../../internal';

export class RemoveSlotAction extends Action {
  messageType: MessageType = MessageType.REMOVE_SLOT_ACTION;

  name: string;
  target: Entity;

  constructor({caster, target, using, name, tags = []}: RemoveSlotAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._removeSlot(this.name);
  }
}

export namespace RemoveSlotAction {
  export interface EntityParams extends ActionParameters {
    name: string,
  }

  export interface Params extends EntityParams {
    target: Entity;
  }

}
