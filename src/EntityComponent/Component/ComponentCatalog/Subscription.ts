import { Component, ComponentCatalog, Scope } from "../../../internal";
import { actionFunction } from "../../Component";

export class Subscription {
    id: string;

    constructor(
        public readonly component: Component,
        public readonly subscriber: ComponentCatalog,
        public readonly target: ComponentCatalog,
        public readonly phase: string,
        public readonly fn: actionFunction,
        public readonly scope?: Scope
    ) { 
        this.id = this.getID();
    }

    getID(): string {
        return this.component.id + this.phase + this.scope;
    }
}