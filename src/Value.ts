import Modifier, { ModifierType } from './Modifier'

export default class Value<T> {
    _base: T;
    _calculated: T;
    _modifiers: Array<Modifier<T>>;

    constructor(base: T) {
        this._base = base;
        this._calculated = base;
        this._modifiers = [];
    }

    // Calculate new value, dispatching event for optional modifier
    public calculate(event?: null): void {
        let newValue: T = this._base;
        // Iterate over all modifiers
        this._modifiers.map(m => {
            switch(m._type) {
                case ModifierType.Adjust:
                    //<number>newValue += (m._value as number);
                    break;
                case ModifierType.Set:
                    newValue = m._value;
                    break;
                default:
                    newValue = m._value;
                    break;
            }
        });
        // Set to the current value
        this._calculated = newValue;
    }

    // Set the base value from a direct action
    public set(value: T) {
        this._base = value;
        this.calculate();
    }

    // Adjust the base value from a direct action
    public adjust(amount: T) {
        //this._base += amount;
        this.calculate(); 
    }

    // Apply a Modifier from an Effect and recalculate values
    public apply(modifier: Modifier<T>, event?: null ): void {
        this._modifiers.push(modifier);
        this.calculate();
    }

    // Remove a Modifier from an Effect and recalculate values
    public remove(modifier: Modifier<T>) {
        this._modifiers.splice(this._modifiers.indexOf(modifier), 1);
        this.calculate();
    }
}