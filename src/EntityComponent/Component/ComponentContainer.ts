import { Listener, ComponentCatalog, Scope } from '../../internal.js';

export interface ComponentContainer extends Listener {
    id: string;
    components: ComponentCatalog;
    isPublished(): boolean;

    getComponentContainerByScope(scope: Scope): ComponentContainer | undefined;
}