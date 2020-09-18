import { Value } from './Value';

export default interface Property {
    // min, max, current, modifiers
    name: string;
    current: Value;
}

export class NumericProperty implements Property {
    name: string;
    current: Value;
    min: Value;
    max: Value;
}

export class StringProperty implements Property {
    name: string;
    current: Value;
}

// TODO: icon, position?