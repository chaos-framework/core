import { Action, Scope, VisibilityType } from '../internal';

export interface Viewer {
  getWorldScopes(): Map<string, Scope>;
}

export interface Broadcaster {
  queueForBroadcast(a: Action, visibility: VisibilityType, serialized: string): void;
}