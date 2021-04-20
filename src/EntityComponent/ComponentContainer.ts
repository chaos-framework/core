import { Component, ComponentCatalog, Scope } from '../internal';

export interface ComponentContainer {
    id: string;
    components: ComponentCatalog;
    isPublished(): boolean;

    getComponentContainerByScope(scope: Scope): ComponentContainer | undefined;
}