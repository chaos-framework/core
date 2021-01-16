import { Queue } from 'queue-typescript';

import { Action } from '../internal';
import { Broadcaster } from './';

export default class Team implements Broadcaster {
  players = new Set<string>();
  entities = new Set<string>();
  entitiesInSight = new Set<string>();
  broadcastQueue = new Queue<Action>(); // TODO is this going to be an action or a tuple / something with metadata?

  constructor(public name: string) {}

  queueForBroadcast(a: Action) {
    this.broadcastQueue.enqueue(a);
  }

  // TODO action generators for adding/removing players
}
