import { v4 as uuid } from 'uuid';
import { Queue } from 'queue-typescript';

import { VisibilityType } from '../Events';
import { Game, Action, Scope, PublishEntityAction } from '../internal';
import { Broadcaster, Player } from './';

export default class Team implements Broadcaster {
  id: string = uuid();
  players = new Set<string>();
  entities = new Set<string>();
  entitiesInSight = new Set<string>();
  scopesByWorld: Map<string, Scope> = new Map<string, Scope>();

  constructor(public name: string) {
    // TODO make addition / removal of teams possible post-initialization through actions
    Game.getInstance().teams.set(this.id, this);
    Game.getInstance().teamsByName.set(this.name, this);
  }

  queueForBroadcast(a: Action, visibility: VisibilityType, serialized: string) {
    const game = Game.getInstance();
    // Add or remove entities from sight list based on visibility type and existing seen entities
    const movingEntity = a instanceof PublishEntityAction ? a.entity : a.target;
    if(game.perceptionGrouping === 'team' && movingEntity) {
      // Cache entity ID
      const id = movingEntity.id;
      switch(visibility) {
        // If vision is lost or we can't see this entity, forget them
        case VisibilityType.NOT_VISIBLE:
            this.entitiesInSight.delete(id);
          break;
        case VisibilityType.LOSES_VISION:
            this.entitiesInSight.delete(id);
          break;
        // Add if the entity is visible -- even if already added
        case VisibilityType.VISIBLE:
            this.entitiesInSight.add(id);
            break;
      }
    }
    // Queue broadcast for all players
    for(const id of this.players) {
      const p = game.players.get(id);
      if(p !== undefined) {
        p.queueForBroadcast(a, visibility, serialized);
      }
    }
  }

  // TODO action generator

  _addPlayer(playerId: string) {
      this.players.add(playerId);
  }

  // TODO action generator

  _removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  // TODO action generators for adding/removing players
}
