import { 
  Action, ActionParameters, Entity, Component, ValueType, Value, 
  ModificationMethod, Modification, AbsoluteModification, AdjustmentModification, MultiplierModification,

} from '../../internal'; 

// ADD
export class PropertyAdditionAction extends Action {
  target: Entity;
  name: string;
  current: number;
  min?: number;
  max?: number;

  constructor({ caster, target, name, current, min, max, using, tags }: PropertyAdditionAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
    this.current = current;
    this.min = min;
    this.max = max;
  }

  apply(): boolean {
    return this.target._addProperty(this.name, this.current, this.min, this.max);
  }
}

export namespace PropertyAdditionAction {
  export interface EntityParams extends ActionParameters {
    name: string, 
    current: number;
    min?: number;
    max?: number;
  }
  
  export interface Params extends EntityParams {
    target: Entity
  }
}

// REMOVE
export class PropertyRemovalAction extends Action {
  target: Entity;
  name: string;

  constructor({ caster, target, name, using, tags }: PropertyRemovalAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._removeProperty(this.name);
  }
}

export namespace PropertyRemovalAction { 
  export interface EntityParams extends ActionParameters {
    name: string, 
  }
  export interface Params extends EntityParams {
    target: Entity
  }
}

// CHANGE (adjust/set)
export class PropertyChangeAction extends Action {
  property: string;
  type: 'adjust' | 'set';
  value: 'current' | 'min' | 'max';
  amount: number;
  finalAmount: number;
  adjustments: { amount: number, by?: Entity | Component }[] = [];
  multipliers: { amount: number, by?: Entity | Component }[] = [];

  constructor({ caster, target, property, type = 'adjust', value = 'current', amount, using, tags }: PropertyChangeAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.property = property;
    this.type = type;
    this.value = value;
    this.amount = amount;
    this.finalAmount = amount;
  }

  apply(): boolean {
    this.calculate();
    const { target, property, type, finalAmount } = this;
    const p = this.target?.properties.get(property);
    // See if we have this property
    if(p) {
      // Figure out which value we're adjusting (current, min, or max)
      let v: Value;
      switch(this.value) {
        case 'min':
          v = p.min;
          break;
        case 'max':
          v = p.max;
          break;
        default:
          v = p.current;
          break;
      }
      // Either adjust or set this number
      type === 'adjust' ? v._adjust(finalAmount) : v._set(finalAmount);
      return true;
    }
    return false;
  }

  calculate(): number { 
    this.adjustments.map(adjustment => this.finalAmount += adjustment.amount);
    this.multipliers.map(multiplier => this.finalAmount *= multiplier.amount);
    return this.finalAmount;
  }

  adjust(amount: number, by?: Entity | Component, breadcrumbs?: string[], unique?: boolean) {
    // TODO this logic should be lifted up into Action itself
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.adjustments.push({ amount, by });
  }

  multiply(amount: number, by?: Entity | Component, breadcrumbs?: string[], unique?: boolean) {
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.multipliers.push({ amount, by });
  }

  effects(key: string): boolean {
    return key === this.property;
  }

  increases(key: string): boolean {
    return this.effects(key)&& this.amount > 0;
  }

  decreases(key: string): boolean {
    return this.effects(key) && this.amount < 0;
  }

  buffs(key: string): boolean {
    return this.effects(key)&& this.amount > 0;
  }

  damages(key: string): boolean {
    return this.effects(key) && this.amount < 0;
  }

}

export namespace PropertyChangeAction {
  export interface ValueParams extends ActionParameters {
    amount: number,
  }
  
  export interface Params extends ValueParams {
    target: Entity,
    property: string,
    value?: 'current' | 'min' | 'max',
    type?: 'adjust' | 'set'
  }
}

// MODIFY
export class PropertyModificationAction extends Action {
  property: string;             // What property to modify
  value: ValueType;             // Current / Min / Max value
  method: ModificationMethod;   // Absolute, Set, or Adjustment
  amount: number;               // The value to modify by

  constructor({ caster, target, property, value = ValueType.Current, method = ModificationMethod.Adjustment, amount, using, tags }: PropertyModificationAction.Params) {
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

export namespace PropertyModificationAction {
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
