import Property from './Property'
import Component from './Component'

class Entity {
    private static idCount = 0;
    readonly id: number;

    properties: { [name: string]: Property };

    traits: Component[];
    statuses: Component[];
    components: Component[];

    constructor() {
        this.id = ++Entity.idCount;
        this.properties = {};
    }
}

export default Entity