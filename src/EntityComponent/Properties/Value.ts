import {
  Property,
  Modification,
  AdjustmentModification,
  MultiplierModification,
  AbsoluteModification,
  PropertyChangeAction,
  ModifyPropertyAction,
} from '../../internal.js';

export enum ModificationMethod {
  Absolute,
  Adjustment,
  Multiplier,
}

export class Value {
  property: Property; // parent property
  base: number;
  calculated: number;
  type: 'current' | 'min' | 'max';
  absolutes: AbsoluteModification[] = [];
  adjustments: AdjustmentModification[] = [];
  multipliers: MultiplierModification[] = [];

  constructor(property: Property, type: 'current' | 'min' | 'max', base: number) {
    this.property = property;
    this.type = type;
    this.base = base;
    this.calculated = base;
  }

  // Calculate new value
  public calculate(): void {
    let newValue: number = this.base;
    // Iterate over all modifiers
    // Order of operations is overrides (absolute values), adjustments, and multipliers
    for (let m of this.absolutes) {
      this.calculated = m.apply(newValue);
      return;
    }
    this.adjustments.map((m) => {
      newValue = m.apply(newValue);
    });
    this.multipliers.map((m) => {
      newValue = m.apply(newValue);
    });
    // Set to the current value
    this.calculated = newValue;
  }

  // Create an adjust action
  public set({ amount, caster, using, metadata }: PropertyChangeAction.ValueParams): PropertyChangeAction {
    return new PropertyChangeAction({
      caster,
      target: this.property.entity,
      property: this.property,
      type: 'set',
      value: this.type,
      amount,
      using,
      metadata,
    });
  }

  // Set the base value from a direct action, return delta after calculating
  public _set(value: number): number {
    const originalBase = this.base;
    this.base = value;
    this.calculate();
    return this.calculated - originalBase;
  }

  // Create an adjust action
  public adjust({ amount, caster, using, metadata }: PropertyChangeAction.ValueParams): PropertyChangeAction {
    return new PropertyChangeAction({
      caster,
      target: this.property.entity,
      property: this.property,
      type: 'adjust',
      value: this.type,
      amount,
      using,
      metadata,
    });
  }

  // Adjust the base value from a direct action, return delta after calculating
  public _adjust(amount: number): number {
    const originalBase = this.base;
    this.base += amount;
    this.calculate();
    return this.calculated - originalBase;
  }

  // Create a modifier application action
  public modify({ caster, method, amount, using, metadata }: ModifyPropertyAction.ValueParams): ModifyPropertyAction {
    return new ModifyPropertyAction({
      propertyName: this.property.name,
      target: this.property.entity,
      caster,
      method,
      amount,
      using,
      metadata,
    });
  }

  // Apply a Modifier from an Effect and recalculate values
  public _apply(modification: Modification): void {
    if (modification instanceof AdjustmentModification) {
      this.adjustments.push(modification);
    }
    if (modification instanceof MultiplierModification) {
      this.multipliers.push(modification);
    }
    if (modification instanceof AbsoluteModification) {
      this.absolutes.push(modification);
    }
    modification.value = this;
    this.calculate();
  }

  // Remove a Modifier from an Effect and recalculate values
  public _remove(modification: Modification) {
    if (modification instanceof AdjustmentModification) {
      this.adjustments.splice(this.adjustments.indexOf(modification), 1);
    }
    if (modification instanceof MultiplierModification) {
      this.multipliers.splice(this.multipliers.indexOf(modification), 1);
    }
    if (modification instanceof AbsoluteModification) {
      this.absolutes.splice(this.absolutes.indexOf(modification), 1);
    }
    this.calculate();
  }
}
