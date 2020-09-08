export enum ModifierType {
    Adjust,
    Set,
    Absolute // sets and halts all future modifications when calculating
}

export class NumericModifier {
    _type: ModifierType = ModifierType.Adjust;
    _value: number;
    
    constructor(value: number, type: ModifierType = ModifierType.Adjust) {
        this._value = value;
        this._type = type;
    }
}