import { Listener, ComponentCatalog, Scope } from '../../internal';

export interface ComponentContainer extends Listener {
    id: string;
    components: ComponentCatalog;
    isPublished(): boolean;

    getComponentContainerByScope(scope: Scope): ComponentContainer | undefined;
}