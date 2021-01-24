import { Action } from '..';
import { VisibilityType } from '../Events';

export default interface Broadcaster {
  queueForBroadcast(a: Action, visibility: VisibilityType, serialized: string): void;
}