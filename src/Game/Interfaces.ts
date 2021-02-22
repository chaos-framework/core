import { Action, Scope, VisibilityType } from '../internal';

export interface Viewer {
  getWorldScopes(): Map<string, Scope>;
  getEntitiesInSight(): Set<string>;
}

export interface ActionQueuer {
  enqueueAction(a: Action, visibility: VisibilityType, serialized: string): void;
}