import { v4 as uuid } from 'uuid';
import { Entity } from '..';
import Scope from '../World/Scope';
import Team from './Team';

export default class Player {
  id: string;
  entities = new Set<string>();
  teams = new Set<string>();
  admin = false;
  scopesByWorld = new Map<string, Scope>();

  constructor({ name, teams = [], admin = false}: {name:string, teams: string[], admin: boolean}) {
    this.id = uuid();
  }

  disconnect() {};

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
