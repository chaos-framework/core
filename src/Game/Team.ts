// tslint:disable: forin
import { v4 as uuid } from 'uuid';

import { Game, Action, Scope, PublishEntityAction, Player, EntityScope, VisibilityType, WorldScope, NestedMap, Entity } from '../internal';
import { Viewer, ActionQueuer } from './Interfaces';

export class Team implements Viewer, ActionQueuer {
  id: string = uuid();
  name: string;

  players = new Set<string>();
  entities = new NestedMap<Entity>(this.id, 'team');

  sensedEntities: NestedMap<Entity>;

  scopesByWorld: Map<string, WorldScope> = new Map<string, WorldScope>();

  constructor({ id = uuid(), name, players = [] }: Team.ConstructorParams) {
    this.id = id;
    this.name = name ? name : this.id.substring(this.id.length - 8);
    this.players = new Set<string>(players);
    this.sensedEntities = new NestedMap<Entity>(id, 'team');
    Game.getInstance().teams.set(this.id, this);
    Game.getInstance().teamsByName.set(this.name, this);
  }

  enqueueAction(a: Action) {
    const game = Game.getInstance();
    // Queue broadcast for all players
    for(const id of this.players) {
      const p = game.players.get(id);
      if(p !== undefined) {
        p.enqueueAction(a);
      }
    }
  }

  getWorldScopes(): Map<string, WorldScope> {
    return this.scopesByWorld;
  }

  getSensedAndOwnedEntities(): Map<string, Entity> {
    return new Map([...this.entities.map.entries(), ...this.sensedEntities.map.entries()]);
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
    this.sensedEntities.addChild(player.sensedEntities);
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
    this.sensedEntities.removeChild(player.id);
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
