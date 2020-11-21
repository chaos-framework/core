export enum ModificationType {
    Adjust,
    Set,
    Absolute // sets and halts all future modifications when calculating
}

export default class Modification {
    _type: ModificationType = ModificationType.Adjust;
    _value: number;
    
    constructor(value: number, type: ModificationType = ModificationType.Adjust) {
        this._value = value;
        this._type = type;
    }
}