import { Action, EntityScope, WorldScope, VisibilityType } from '../internal';

export interface Viewer {
  getWorldScopes(): Map<string, WorldScope>;
  getEntityScope(): EntityScope;
}

export interface ActionQueuer {
  enqueueAction(a: Action, visibility: VisibilityType, serialized: string): void;
}