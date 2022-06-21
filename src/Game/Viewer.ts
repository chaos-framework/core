import { Action, Entity, NestedMap, NestedSet } from '../internal.js';

export interface Viewer {
  entities: Map<string, Entity>;
  sensedEntities: NestedMap<Entity>;
  visibleChunks: NestedSet;
  getSensedAndOwnedEntities(): Map<string, Entity>;
  queueForBroadcast(a: Action, serialized?: any): void;
}
