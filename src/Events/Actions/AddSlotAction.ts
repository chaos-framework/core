import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator
} from '../../internal.js';

export class AddSlotAction extends Action {
  actionType = ActionType.ADD_SLOT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  name: string;
  target: Entity;

  constructor({ caster, target, using, name, metadata }: AddSlotAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.name = name;
  }

  *apply(): ProcessEffectGenerator {
    return this.target._addSlot(this.name);
  }
}

// tslint:disable-next-line: no-namespace
export namespace AddSlotAction {
  export interface EntityParams extends ActionParameters {
    name: string;
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
