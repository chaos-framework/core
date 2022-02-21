import {
  Action,
  ActionParameters,
  Entity,
  ValueType,
  Value,
  ModificationMethod,
  Modification,
  AbsoluteModification,
  AdjustmentModification,
  MultiplierModification,
  ActionType,
  BroadcastType,
  ActionEffectGenerator
} from '../../internal.js';

export class ModifyPropertyAction extends Action {
  actionType: ActionType = ActionType.MODIFY_PROPERTY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  propertyName: string; // What property to modify
  value: ValueType; // Current / Min / Max value
  method: ModificationMethod; // Absolute, Set, or Adjustment
  amount: number; // The value to modify by

  constructor({
    caster,
    target,
    propertyName,
    value = 'current',
    method = ModificationMethod.Adjustment,
    amount,
    using,
    metadata
  }: ModifyPropertyAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.propertyName = propertyName;
    this.value = value;
    this.method = method;
    this.amount = amount;
  }

  *apply(): ActionEffectGenerator {
    const { target, value: type, propertyName: name, method, amount } = this;
    const property = target?.properties.get(name);
    // See if we have this property
    if (property !== undefined) {
      // Figure out which value we're adjusting (current, min, or max)
      let value: Value;
      switch (type) {
        case 'min':
          value = property.min;
          break;
        case 'max':
          value = property.max;
          break;
        default:
          value = property.current;
          break;
      }
      let modification: Modification;
      switch (method) {
        case ModificationMethod.Absolute:
          modification = new AbsoluteModification(amount);
          break;
        case ModificationMethod.Multiplier:
          modification = new MultiplierModification(amount);
          break;
        default:
          modification = new AdjustmentModification(amount);
          break;
      }
      value._apply(modification);
      return true;
    }
    return false;
  }

  effects(key: string): boolean {
    return key === this.propertyName;
  }
}

export namespace ModifyPropertyAction {
  export interface ValueParams extends ActionParameters {
    amount: number;
    method?: ModificationMethod;
  }

  export interface Params extends ValueParams {
    target: Entity;
    propertyName: string;
    value?: ValueType;
  }
}
