import { Entity, Value } from '../../internal.js';

export enum ValueType { Current, Min, Max };

export default class Property implements Property {
    entity: Entity;
    name: string;
    current: Value;
    min: Value;
    max: Value;

    constructor(entity: Entity, name: string, current: number = 0, min: number = -Infinity, max: number = Infinity) {
        this.entity = entity;
        this.name = name;
        this.current = new Value(this, 'current', current);
        this.min = new Value(this, 'min', min);
        this.max = new Value(this, 'max', max);
    }
}
