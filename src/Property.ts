import { Value } from './Value';

export interface Property {
    // min, max, current, modifiers
    _name: string;
    _current: Value;
}

export class NumericProperty implements Property {
    _name: string;
    _current: Value;
    _min: Value;
    _max: Value;
}

export class StringProperty implements Property {
    _name: string;
    _current: Value;
}

// TODO: icon, position?