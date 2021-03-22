import { Component, ComponentCatalog, Scope } from '../internal';

export interface ComponentContainer {
    components: ComponentCatalog;
    isPublished(): boolean;

    getComponentContainerByScope(scope: Scope): ComponentContainer | undefined;
}