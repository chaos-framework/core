import Entity from '../Entity';
import Value from './Value';

export enum ValueType { Current, Min, Max }

export default class Property implements Property {
    current: Value;
    min: Value;
    max: Value;
    entity?: Entity;

    constructor(current?: Value, min?: Value, max?: Value) {
        this.current = current ? current: new Value(0);
        this.min = min ? min : new Value(-Infinity);
        this.max = max ? max : new Value(Infinity);
    }
}
