import { NumericModifier, ModifierType } from './Modifier'

export class NumericValue {
    _base: number;
    _calculated: number;
    _modifiers: NumericModifier[];

    constructor(base: number) {
        this._base = base;
        this._calculated = base;
        this._modifiers = [];
    }

    // Calculate new value, dispatching event for optional modifier
    public calculate(event?: null): void {
        let newValue: number = this._base;
        // Iterate over all modifiers
        this._modifiers.map(m => {
            switch(m._type) {
                case ModifierType.Adjust:
                    newValue += m._value;
                    break;
                case ModifierType.Set:
                    newValue = m._value;
                    break;
                case ModifierType.Absolute:
                    this._calculated = m._value;
                    return;
                default:
                    newValue += m._value;
                    break;
            }
        });
        // Set to the current value
        this._calculated = newValue;
    }

    // Set the base value from a direct action
    public set(value: number) {
        this._base = value;
        this.calculate();
    }

    // Adjust the base value from a direct action
    public adjust(amount: number) {
        //this._base += amount;
        this.calculate(); 
    }

    // Apply a Modifier from an Effect and recalculate values
    public apply(modifier: NumericModifier, event?: null ): void {
        this._modifiers.push(modifier);
        this.calculate();
    }

    // Remove a Modifier from an Effect and recalculate values
    public remove(modifier: NumericModifier) {
        this._modifiers.splice(this._modifiers.indexOf(modifier), 1);
        this.calculate();
    }
}