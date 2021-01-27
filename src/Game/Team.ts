import { v4 as uuid } from 'uuid';
import { Queue } from 'queue-typescript';

import { VisibilityType } from '../Events';
import { Game, Action, Scope, PublishEntityAction, Player } from '../internal';
import { Viewer, Broadcaster } from './Interfaces';
import { Entity } from '../EntityComponent';

export default class Team implements Viewer, Broadcaster {
  id: string = uuid();
  players = new Set<string>();
  entities = new Set<string>();
  entitiesThrough = new Map<string, Set<string>>();
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

  getWorldScopes(): Map<string, Scope> {
    return this.scopesByWorld;
  }

  // TODO action generator

  _addPlayer(player: Player) {
    const game = Game.getInstance();
    this.players.add(player.id);
    player._joinTeam(this);
    // Gather up all the entities we have through this player
    for(let entityId of player.entities) {
      const entity = game.getEntity(entityId);
      if(entity) {
        this.addEntity(player.id, entityId);
        entity.teams.add(this.id);
      }
    }
  }

  // TODO action generator

  _removePlayer(player: Player) {
    const game = Game.getInstance();
    this.players.delete(player.id);
    player._leaveTeam(this);
    for(let entityId of player.entities) {
      // Remove entity, checking that it's not also on this team through some other player
      const fullyRemoved = this.removeEntity(player.id, entityId);
    }
  }

  // Add entity through a player.
  // Should only be called by Player, otherwise happens naturally with player joining team via proper action
  addEntity(playerId: string, entityId: string): void {
    if(this.entitiesThrough.has(entityId)) {
      this.entitiesThrough.get(entityId)!.add(playerId);
    } else {
      this.entities.add(entityId);
      const s = new Set<string>();
      s.add(playerId);
      this.entitiesThrough.set(entityId, s);
      Game.getInstance().getEntity(entityId)!.teams.add(this.id);
      // TODO handling sight when entities added to existing team
      // this.entitiesInSight.add(entityId);
    }
  }

  // Remove entity THROUGH a player, assuming no other player provides a team-entity relationship.
  // Should only be called by Player, otherwise happens naturally with player leaving team via proper action
  removeEntity(playerId: string, entityId: string): boolean {
    const playersThisTeamHasThisEntityThrough = this.entitiesThrough.get(entityId)!;
    playersThisTeamHasThisEntityThrough.delete(playerId);
    if(playersThisTeamHasThisEntityThrough.size === 0) {
      this.entities.delete(entityId);
      this.entitiesInSight.delete(entityId);
      this.entitiesThrough.delete(entityId);
      Game.getInstance().getEntity(entityId)!.teams.delete(this.id);
      return true;
      // TODO handling sight when entities added to existing team
    }
    return false;
  }

}
