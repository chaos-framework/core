import { v4 as uuid } from 'uuid';

import { VisibilityType } from '../Events';
import { Game, Action, Scope, PublishEntityAction, Player } from '../internal';
import { Viewer, ActionQueuer } from './Interfaces';

export class Team implements Viewer, ActionQueuer {
  name: string;
  id: string = uuid();
  players = new Set<string>();
  entities = new Set<string>();
  entitiesThrough = new Map<string, Set<string>>();
  entitiesInSight = new Set<string>();
  scopesByWorld: Map<string, Scope> = new Map<string, Scope>();

  constructor({ id = uuid(), name, players = [] }: Team.ConstructorParams) {
    this.id = id;
    this.name = name ? name : this.id.substring(this.id.length - 8)
    this.players = new Set<string>(players);
    Game.getInstance().teams.set(this.id, this);
    Game.getInstance().teamsByName.set(this.name, this);
  }

  enqueueAction(a: Action, visibility: VisibilityType, serialized: string) {
    const game = Game.getInstance();
    // Queue broadcast for all players
    for(const id of this.players) {
      const p = game.players.get(id);
      if(p !== undefined) {
        p.enqueueAction(a, visibility, serialized);
      }
    }
  }

  getWorldScopes(): Map<string, Scope> {
    return this.scopesByWorld;
  }

  getEntitiesInSight(): Set<string> {
    return this.entitiesInSight;
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

  serializeForClient(): Team.SerializedForClient {
    return { id: this.id, name: this.name, players: Array.from(this.players) };
  }

}

export namespace Team {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    players?: string[]
  }

  export interface Serialized {
    id: string,
    name: string,
    players: string[]
  }

  export interface SerializedForClient {
    id: string,
    name?: string,
    players?: string[]
  }

  export function Deserialize(json: Team.Serialized): Team {
    return new Team(json);
  }

  export function DeserializeAsClient(json: Team.SerializedForClient): Team {
    return new Team(json);
  }
}
