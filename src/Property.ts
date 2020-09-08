import Value from './Value';

class Property<T> {
    // min, max, current, modifiers
    _name: string;
    _min: Value<T>;
    _max: Value<T>;
    _cur: Value<T>;

    constructor(name: string, min: T, max: T, cur: T) {
        this._name = name; this._min = new Value(min); this._max = new Value(max); this._cur = new Value(cur);
    }
}