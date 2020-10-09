export default abstract class Component {
    private static idCounter = 0;

    id: number;
    data: object;
    parent?: ComponentContainer;
    name?: string;

    // TODO listens to, reacts to

    constructor() {
        this.id = ++Component.idCounter;
        this.data = {};
    }

    static setIdCounter(i: number): void {
        Component.idCounter = i;
    }

    serialize(): object {
        return { id: this.id, name: this.name, data: this.data } // TODO convert to json string?
    }

    unserialize(id: number, name: string, data: object) {

    }
}

export interface ComponentContainer {
    components: Component[];
}