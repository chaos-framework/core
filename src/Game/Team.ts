// tslint:disable: forin
import { v4 as uuid } from 'uuid';

import { Chaos, Action, Scope, PublishEntityAction, Player, EntityScope, VisibilityType, WorldScope, NestedMap, Entity } from '../internal';
import { NestedChanges } from '../Util/NestedMap';
import { Viewer, ActionQueuer } from './Interfaces';

export class Team implements Viewer, ActionQueuer {
  id: string = uuid();
  name: string;

  players = new Set<string>();
  entities = new Map<string, Entity>();

  sensedEntities: NestedMap<Entity>;

  scopesByWorld: Map<string, WorldScope> = new Map<string, WorldScope>();

  constructor({ id = uuid(), name, players = [] }: Team.ConstructorParams) {
    this.id = id;
    this.name = name ? name : this.id.substring(this.id.length - 8);
    this.players = new Set<string>(players);
    this.sensedEntities = new NestedMap<Entity>(id, 'team');
    Chaos.teams.set(this.id, this);
    Chaos.teamsByName.set(this.name, this);
  }

  enqueueAction(a: Action) {
    // Queue broadcast for all players
    for(const id of this.players) {
      const p = Chaos.players.get(id);
      if(p !== undefined) {
        p.enqueueAction(a);
      }
    }
  }

  getWorldScopes(): Map<string, WorldScope> {
    return this.scopesByWorld;
  }

  getSensedAndOwnedEntities(): Map<string, Entity> {
    return new Map([...this.entities.entries(), ...this.sensedEntities.map.entries()]);
  }

  // TODO action generator

  _addPlayer(player: Player) {
    // Don't add the same player twice
    if(this.players.has(player.id)) {
      return false;
    }
    this.players.add(player.id);
    player._joinTeam(this);
  }

  // TODO action generator

  _removePlayer(player: Player) {
    if(!this.players.has(player.id)) {
      return false;
    }
    this.players.delete(player.id);
    player._leaveTeam();
  }

  serializeForClient(): Team.SerializedForClient {
    return { id: this.id, name: this.name, players: Array.from(this.players) };
  }

  // TODO action generator
  _addEntity(entity: Entity): NestedChanges | undefined {
    if(this.entities.has(entity.id)) {
      return undefined;
    }
    this.entities.set(entity.id, entity);
    return this.sensedEntities.addChild(entity.sensedEntities);
  }

  _removeEntity(entity: Entity): NestedChanges | undefined {
    if(!this.entities.has(entity.id)) {
      return undefined;
    } else {
      this.entities.delete(entity.id);
      return this.sensedEntities.removeChild(entity.id);
    }
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
