import { Modification, ModificationType } from './Modification'

export default class Value {
    base: number;
    calculated: number;
    modifiers: Modification[];

    constructor(base: number) {
        this.base = base;
        this.calculated = base;
        this.modifiers = [];
    }

    // Calculate new value, dispatching event for optional modifier
    public calculate(event?: null): void {
        let newValue: number = this.base;
        // Iterate over all modifiers
        this.modifiers.map(m => {
            switch(m._type) {
                case ModificationType.Adjust:
                    newValue += m._value;
                    break;
                case ModificationType.Set:
                    newValue = m._value;
                    break;
                case ModificationType.Absolute:
                    // Set and return directly
                    this.calculated = m._value;
                    return;
                default:
                    newValue += m._value;
                    break;
            }
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
        //this._base += amount;
        this.calculate(); 
    }

    // Apply a Modifier from an Effect and recalculate values
    public apply(modifier: Modification, event?: null ): void {
        this.modifiers.push(modifier);
        this.calculate();
    }

    // Remove a Modifier from an Effect and recalculate values
    public remove(modifier: Modification) {
        this.modifiers.splice(this.modifiers.indexOf(modifier), 1);
        this.calculate();
    }
}