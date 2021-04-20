import { Component, ComponentCatalog, ComponentType, Scope } from "../../internal";

export class Subscription {
    id: string;

    constructor(
        public readonly component: Component,
        public readonly subscriber: ComponentCatalog,
        public readonly target: ComponentCatalog,
        public readonly type: ComponentType,
        public readonly scope?: Scope
    ) { 
        this.id = this.getID();
    }

    getID(): string {
        return this.component.id + this.type + this.scope;
    }
}