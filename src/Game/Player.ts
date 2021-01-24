import { Queue } from 'queue-typescript';
import { v4 as uuid } from 'uuid';
import { Broadcaster, Game } from '.';
import { Action, Entity } from '..';
import { VisibilityType } from '../internal';
import Scope from '../World/Scope';
import Team from './Team';

export default class Player implements Broadcaster {
  id: string = uuid();
  username: string;
  entities = new Set<string>();
  teams = new Set<string>();
  admin = false;
  scopesByWorld: Map<string, Scope>;
  broadcastQueue = new Queue<any>();
  entitiesInSight: Set<string>;

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
      game.teams.get(teamId)!._addPlayer(this.id);
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
  }

  queueForBroadcast(a: Action, visibility: VisibilityType, serialized: string) {
    this.broadcastQueue.enqueue(a);
  }

  disconnect() { };

  _ownEntity(e: Entity): boolean {
    this.entities.add(e.id);
    // TODO modify active chunks
    return true;
  }

  _disownEntity(e: Entity): boolean {
    return this.entities.delete(e.id);
  }

  _joinTeam(team: string): boolean {
    this.teams.add(team);
    return true;
  }

  _leaveTeam(team: string): boolean {
    return this.entities.delete(team);
  }

}
