import { Queue } from 'queue-typescript';
import { v4 as uuid } from 'uuid';
import { Game, Team, Action, Entity, Scope } from '../internal';
import { VisibilityType } from '../internal';
import { Viewer, Broadcaster } from './Interfaces';

export default class Player implements Viewer, Broadcaster {
  id: string = uuid();
  username: string;
  entities = new Set<string>();
  teams = new Set<string>();
  admin = false;
  scopesByWorld: Map<string, Scope>;
  broadcastQueue = new Queue<any>();
  entitiesInSight: Set<string>;

  // TODO publishing this should be an action
  constructor({ username, teams = [], admin = false }: { username: string, teams?: string[], admin?: boolean }) {
    this.id = uuid();
    this.username = username;
    this.admin = admin;
    const game = Game.getInstance();
    // Make sure that we weren't passed an array of teams if the game's perceptionGrouping is 'team'
    // This is because you can't (yet) meaningfully share a scope with multiple teams
    if (teams.length > 1 && game.perceptionGrouping === 'team') {
      throw new Error(); // TODO ERROR
    }
    // Make sure the team(s) exists
    for (const teamId of teams) {
      if (!game.teams.has(teamId)) {
        throw new Error(); // TODO ERROR
      }
      this.teams.add(teamId);
      game.teams.get(teamId)!._addPlayer(this);
    }
    // If game is has team visibility and assigned to a (single) team, reference that team's scope directly
    if(game.perceptionGrouping === 'team' && this.teams.size === 1) {
      const team = game.teams.get(this.teams.values().next().value)!;
      this.scopesByWorld = team.scopesByWorld;
      this.entitiesInSight = team.entitiesInSight;
    } else {
      this.scopesByWorld = new Map<string, Scope>();
      this.entitiesInSight = new Set<string>();
    }
    game.players.set(this.id, this);
    // If this player is not part of any teams indicate so in the game
    if(this.teams.size === 0) {
      game.playersWithoutTeams.set(this.id, this);
    }
  }

  getWorldScopes(): Map<string, Scope> {
    return this.scopesByWorld;
  }

  queueForBroadcast(a: Action, visibility: VisibilityType, serialized: string) {
    this.broadcastQueue.enqueue(a);
  }

  disconnect() { };

  _ownEntity(entity: Entity): boolean {
    this.entities.add(entity.id);
    entity.owners.add(this.id);
    if(this.teams.size > 0) {
      const game = Game.getInstance();
      for(let teamId of this.teams) {
        const team = game.teams.get(teamId);
        if(team) {
          team.addEntity(this.id, entity.id);
        }
      }
    }
    // Modify scope, if appropriate
    if (entity.world) {
      let scope = this.scopesByWorld.get(entity.world.id);
      if (scope) {
        scope.addViewer(entity.id, Game.getInstance().viewDistance, entity.position.toChunkSpace());
      } else {
        scope = entity.world.createScope();
        scope.addViewer(entity.id, Game.getInstance().viewDistance, entity.position.toChunkSpace());
        this.scopesByWorld.set(entity.world.id, scope);
      }
    }
    return true;
  }

  _disownEntity(entity: Entity): boolean {
    entity.owners.delete(this.id);
    if(this.teams.size > 0) {
      const game = Game.getInstance();
      for(let teamId of this.teams) {
        const team = game.teams.get(teamId);
        if(team) {
          team.removeEntity(this.id, entity.id);
        }
      }
    }
    this.entities.delete(entity.id);
    return true;
  }

  _joinTeam(team: Team): boolean {
    this.teams.add(team.id);
    if(this.teams.size === 1) {
      Game.getInstance().playersWithoutTeams.delete(this.id);
    }
    // Update any entities that this owns as well
    return true;
  }

  _leaveTeam(team: Team): boolean {
    this.teams.delete(team.id);
    if(this.teams.size === 0) {
      Game.getInstance().playersWithoutTeams.set(this.id, this);
    }
    return this.entities.delete(team.id);
  }

}
