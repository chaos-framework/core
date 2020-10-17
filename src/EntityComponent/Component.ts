export default abstract class Component {
    private static idCounter = 0;

    id: number;
    data: object;
    parent?: ComponentContainer;
    name?: string;

    public: boolean = false;    // can other entities see this component? TODO: needed?
    broadcast: boolean = false; // do we tell client about this component at all?

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