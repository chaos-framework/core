import Property from './Property'
import Component, { ComponentContainer } from './Component'

export default class Entity implements ComponentContainer {
    private static idCounter = 0;
    readonly id: number;
    tags: Set<string>; // TODO make set

    properties: { [name: string]: Property };

    traits: Component[];
    statuses: Component[];
    components: Component[];

    static setIdCounter(i: number): void {
        Entity.idCounter = i;
    }


    constructor(serialized: object) {
        // TODO create from serialized to load from disk/db, and don't increment entity count
        this.id = ++Entity.idCounter;
        this.properties = {};

        this.traits = [];
        this.statuses = [];
        this.components = [];

        this.tags = new Set<string>();
    }

    getProperty(k: string): Property {
        return this.properties[k];
    }

    tag(tag: string): void {
        // TODO add to tags, tag needs to be made set first
    }

    tagged(tag: string): boolean {
        // TODO check if tagged, return true/false
        return false;
    }

    // Check if this Entity "is" (has) as certain component
    is(name: string): boolean {

    }

}
