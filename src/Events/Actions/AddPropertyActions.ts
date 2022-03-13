import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator
} from '../../internal.js';

export class AddPropertyAction extends Action<Entity> {
  actionType = ActionType.ADD_PROPERTY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  name: string;
  current: number;
  min?: number;
  max?: number;

  constructor({
    caster,
    target,
    name,
    current = 0,
    min,
    max,
    using,
    metadata
  }: AddPropertyAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.name = name;
    this.current = current;
    this.min = min;
    this.max = max;
  }

  *apply(): ProcessEffectGenerator {
    return this.target._addProperty(this.name, this.current, this.min, this.max);
  }
}

export namespace AddPropertyAction {
  export interface EntityParams extends ActionParameters<Entity> {
    name: string;
    current?: number;
    min?: number;
    max?: number;
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
