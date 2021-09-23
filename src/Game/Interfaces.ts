import { Action, Entity, WorldScope, VisibilityType } from '../internal';
import { NestedMap } from '../Util/NestedMap';

export interface Viewer {
  entities: Map<string, Entity>;
  sensedEntities: NestedMap<Entity>;
  getSensedAndOwnedEntities(): Map<string, Entity>;
  getWorldScopes(): Map<string, WorldScope>;
}

export interface ActionQueuer {
  enqueueAction(a: Action, visibility: VisibilityType, serialized: string): void;
}