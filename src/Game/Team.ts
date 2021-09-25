// tslint:disable: forin
import { v4 as uuid } from 'uuid';

import { Chaos, Action, ComponentContainer, Player, WorldScope, NestedMap, Entity, ComponentCatalog, Scope, NestedChanges } from '../internal';
import { Viewer, ActionQueuer } from './Interfaces';

export class Team implements Viewer, ActionQueuer, ComponentContainer {
  id: string = uuid();
  name: string;

  players = new Map<string, Player>();
  entities = new Map<string, Entity>();

  sensedEntities: NestedMap<Entity>;

  components: ComponentCatalog = new ComponentCatalog(this);

  scopesByWorld: Map<string, WorldScope> = new Map<string, WorldScope>();

  published = true; // TODO change this?

  constructor({ id = uuid(), name }: Team.ConstructorParams = {}) {
    this.id = id;
    this.name = name ? name : this.id.substring(this.id.length - 8);
    this.sensedEntities = new NestedMap<Entity>(id, 'team');
    Chaos.teams.set(this.id, this);
    Chaos.teamsByName.set(this.name, this);
  }

  isPublished(): boolean {
    return this.published;
  }

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
    if(scope === 'game') {
      return Chaos.reference;
    }
    return undefined;
  };

  enqueueAction(a: Action) {
    // Queue broadcast for all players
    for(const [id, player] of this.players) {
      player.enqueueAction(a);
    }
  }

  modify(action: Action) {
    this.components.modify(action);
  }
  
  react(action: Action) {
    this.components.react(action);
  }

  sense(a: Action): boolean {
    return true;
  }

  senseEntity(e: Entity): boolean {
    return true;
  }

  getWorldScopes(): Map<string, WorldScope> {
    return this.scopesByWorld;
  }

  // TODO refactor as iterator for performance
  getSensedAndOwnedEntities(): Map<string, Entity> {
    return new Map([...this.entities.entries(), ...this.sensedEntities.map.entries()]);
  }

  // TODO action generator
  _addPlayer(player: Player): boolean {
    // Don't add the same player twice
    if(this.players.has(player.id)) {
      return false;
    }
    this.players.set(player.id, player);
    this.sensedEntities.addChild(player.sensedEntities);
    player._joinTeam(this);
    return true;
  }

  // TODO action generator
  _removePlayer(player: Player) {
    if(!this.players.has(player.id)) {
      return false;
    }
    this.players.delete(player.id);
    player._leaveTeam();
  }

  _publish(): boolean {
    if(!Chaos.teams.has(this.id)) {
      return false;
    } else {
      Chaos.teams.set(this.id, this);
      this.published = true;
      return true;
    }
  }

  serializeForClient(): Team.SerializedForClient {
    return { id: this.id, name: this.name };
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
