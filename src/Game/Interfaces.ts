import { Action, EntityScope, Scope, VisibilityType } from '../internal';

export interface Viewer {
  getWorldScopes(): Map<string, Scope>;
  getEntityScope(): EntityScope;
}

export interface ActionQueuer {
  enqueueAction(a: Action, visibility: VisibilityType, serialized: string): void;
}