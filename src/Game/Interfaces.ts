import { Action, Entity, VisibilityType, NestedMap, NestedSet } from '../internal.js';

export interface Viewer {
  entities: Map<string, Entity>;
  sensedEntities: NestedMap<Entity>;
  visibleChunks: NestedSet;
  getSensedAndOwnedEntities(): Map<string, Entity>;
}

export interface ActionQueuer {
  enqueueAction(a: Action, visibility: VisibilityType, serialized: string): void;
}