import { Component, ComponentCatalog, Scope, Listener } from '../internal';

export interface ComponentContainer extends Listener {
    id: string;
    components: ComponentCatalog;
    isPublished(): boolean;

    getComponentContainerByScope(scope: Scope): ComponentContainer | undefined;
}