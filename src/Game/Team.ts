// tslint:disable: forin
import { v4 as uuid } from 'uuid';

import { Game, Action, Scope, PublishEntityAction, Player, EntityScope, VisibilityType, WorldScope, NestedMap, Entity } from '../internal';
import { Viewer, ActionQueuer } from './Interfaces';

export class Team implements Viewer, ActionQueuer {
  id: string = uuid();
  name: string;

  players = new Set<string>();
  entities = new NestedMap<Entity>(this.id, 'team');

  scopesByEntity = new EntityScope();
  scopesByWorld: Map<string, WorldScope> = new Map<string, WorldScope>();

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

  getWorldScopes(): Map<string, WorldScope> {
    return this.scopesByWorld;
  }

  getEntityScope(): EntityScope {
    return this.scopesByEntity;
  }

  // TODO action generator

  _addPlayer(player: Player) {
    // Don't add the same player twice
    if(this.players.has(player.id)) {
      return false;
    }
    this.players.add(player.id);
    // Add player's entity nested map as a child
    this.entities.addChild(player.entities);
    player._joinTeam(this);
  }

  // TODO action generator

  _removePlayer(player: Player) {
    if(!this.players.has(player.id)) {
      return false;
    }
    this.players.delete(player.id);
    // Remove player's entity nested map as child
    this.entities.removeChild(player.id);
    player._leaveTeam(this);
  }

  serializeForClient(): Team.SerializedForClient {
    return { id: this.id, name: this.name, players: Array.from(this.players) };
  }

}

// tslint:disable-next-line: no-namespace
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
