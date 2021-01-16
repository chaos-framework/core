import { Action } from '..';

export default interface Broadcaster {
  queueForBroadcast(a: Action): void;
}