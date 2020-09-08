export enum ModifierType {
    Adjust,
    Set,
    Absolute
}

export default class Modifier<T> {
    _type: ModifierType = ModifierType.Adjust;
    _value: T;

    constructor(type: ModifierType, value: T) {
        this._type = type;
        this._value = value;
    }
}