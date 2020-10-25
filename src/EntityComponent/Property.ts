import Value from './Value';

export enum PropertyType { Current, Min, Max }

export default class Property implements Property {
    current: Value;
    min: Value;
    max: Value;

    constructor(name: string, current: number, min?: number, max?: number) {
        this.current = new Value(current);
        this.min = new Value(min || -Infinity);
        this.max = new Value(max || Infinity);
    }

}
