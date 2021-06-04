import { Action, ActionParameters, Entity, ActionType, BroadcastType } from '../../internal';

export class AddSlotAction extends Action {
  actionType = ActionType.ADD_SLOT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

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
