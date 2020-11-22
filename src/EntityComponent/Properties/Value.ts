import Modification, { AdjustmentModification, MultiplierModification, AbsoluteModification } from './Modification'
import Property from './Property';

export default class Value {
  base: number;
  calculated: number;
  absolutes: AbsoluteModification[] = [];
  adjustments: AdjustmentModification[] = [];
  multipliers: MultiplierModification[] = [];
  property?: Property;

  constructor(base: number) {
    this.base = base;
    this.calculated = base;
  }

  // Calculate new value
  public calculate(): void {
    let newValue: number = this.base;
    // Iterate over all modifiers
    // Order of operations is overrides (absolute values), adjustments, and multipliers
    for(let m of this.absolutes) {
      this.calculated = m.apply(newValue);
      return;
    }
    this.adjustments.map(m => {
      newValue = m.apply(newValue);
    });
    this.multipliers.map(m => {
      newValue = m.apply(newValue);
    });
    // Set to the current value
    this.calculated = newValue;
  }

  // Set the base value from a direct action
  public set(value: number) {
    this.base = value;
    this.calculate();
  }

  // Adjust the base value from a direct action
  public adjust(amount: number) {
    this.base += amount;
    this.calculate();
  }

  // Apply a Modifier from an Effect and recalculate values
  public apply(modification: Modification): void {
    if(modification instanceof AdjustmentModification) { this.adjustments.push(modification); }
    if(modification instanceof MultiplierModification) { this.multipliers.push(modification); }
    if(modification instanceof AbsoluteModification) { this.absolutes.push(modification); }
    modification.value = this;
    this.calculate();
  }

  // Remove a Modifier from an Effect and recalculate values
  public remove(modification: Modification) {
    if(modification instanceof AdjustmentModification) { this.adjustments.splice(this.adjustments.indexOf(modification), 1); }
    if(modification instanceof MultiplierModification) { this.multipliers.splice(this.multipliers.indexOf(modification), 1); }
    if(modification instanceof AbsoluteModification) { this.absolutes.splice(this.absolutes.indexOf(modification), 1); }
    this.calculate();
  }
}
