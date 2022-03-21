import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator
} from '../../internal.js';

export class RemoveSlotAction extends Action<Entity> {
  actionType: ActionType = ActionType.REMOVE_SLOT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  name: string;
  target: Entity;

  constructor({ caster, target, using, name, metadata }: RemoveSlotAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.name = name;
  }

  async *apply(): ProcessEffectGenerator {
    return this.target._removeSlot(this.name);
  }
}

export namespace RemoveSlotAction {
  export interface EntityParams extends ActionParameters<Entity> {
    name: string;
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
