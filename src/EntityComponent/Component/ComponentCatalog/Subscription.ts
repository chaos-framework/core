import { Component, ComponentCatalog, Scope, ActionHandler } from '../../../internal.js';

export class Subscription {
  id: string;

  constructor(
    public readonly component: Component,
    public readonly subscriber: ComponentCatalog,
    public readonly target: ComponentCatalog,
    public readonly phase: string,
    public readonly fn: ActionHandler,
    public readonly scope?: Scope
  ) {
    this.id = this.getID();
  }

  getID(): string {
    return this.component.id + this.phase + this.scope;
  }
}
