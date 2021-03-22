import { 
  Action, ActionParameters, Entity, ValueType, Value, 
  ModificationMethod, Modification, AbsoluteModification, AdjustmentModification, MultiplierModification,
} from '../../internal'; 

export class ModifyPropertyAction extends Action {
  property: string;             // What property to modify
  value: ValueType;             // Current / Min / Max value
  method: ModificationMethod;   // Absolute, Set, or Adjustment
  amount: number;               // The value to modify by

  constructor({ caster, target, property, value = ValueType.Current, method = ModificationMethod.Adjustment, amount, using, tags }: ModifyPropertyAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.property = property;
    this.value = value;
    this.method = method;
    this.amount = amount;
  }

  apply(): boolean {
    const { target, value, property, method, amount } = this;
    const p = target?.properties.get(property);
    // See if we have this property
    if(p) {
      // Figure out which value we're adjusting (current, min, or max)
      let v: Value;
      switch(value) {
        case ValueType.Min:
          v = p.min;
          break;
        case ValueType.Max:
          v = p.max;
          break;
        default:
          v = p.current;
          break;
      }
      let m: Modification;
      switch(method) {
        case ModificationMethod.Absolute:
          m = new AbsoluteModification(amount);
          break;
        case ModificationMethod.Multiplier:
          m = new MultiplierModification(amount);
          break;
        default:
          m = new AdjustmentModification(amount);
          break;
      }
      v._apply(m);
      return true;
    }
    return false;
  }

  effects(key: string): boolean {
    return key === this.property;
  }

}

export namespace ModifyPropertyAction {
  export interface ValueParams extends ActionParameters {
    amount: number,
    method?: ModificationMethod
  }
  
  export interface Params extends ValueParams {
    target: Entity,
    property: string,
    value?: ValueType,
  }
}
