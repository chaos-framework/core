import { Queue } from 'queue-typescript';
import { v4 as uuid } from 'uuid';
import {
  Chaos, Team, Action, Entity, WorldScope, Client,
  NestedMap, PublishPlayerAction, ComponentContainer,
  ComponentCatalog, Scope, MessageType, OwnEntityAction,
  NestedChanges, Viewer, Broadcaster
} from '../internal.js';

// TODO clean up above imports

export class Player implements Viewer, Broadcaster, ComponentContainer {
  id: string = uuid();
  client?: Client;
  username: string;

  team?: Team;                            // teams this player belongs to
  entities = new Map<string, Entity>();   // entities this player "owns"

  components: ComponentCatalog = new ComponentCatalog(this);

  admin = false;
  scopesByWorld: Map<string, WorldScope>;
  
  sensedEntities: NestedMap<Entity>;

  broadcastQueue = new Queue<Action>();
  published = true; // TODO change this?

  constructor({ id = uuid(), username, team, admin = false, client }: Player.ConstructorParams = {}) {
    this.id = id;
    this.username = username ? username: this.id.substring(this.id.length - 6);
    this.admin = admin;
    this.client = client;
    this.entities = new Map<string, Entity>();
    this.sensedEntities = new NestedMap<Entity>(id, 'player');
    // Make sure the team exists, if passed
    if(team) {
      if(!Chaos.teams.has(team)) {
        throw new Error(`Team given for player ${this.username} does not exist!`);
      }
      this.team = Chaos.teams.get(team)!;
    } else {
      Chaos.playersWithoutTeams.set(this.id, this);
    }
    if(Chaos.perceptionGrouping === 'team' && this.team) {
      this.scopesByWorld = this.team.scopesByWorld;
    } else {
      this.scopesByWorld = new Map<string, WorldScope>();
    }
    Chaos.players.set(this.id, this);
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

  owns(entity: Entity | string): boolean {
    return this.entities.has(entity instanceof Entity ? entity.id : entity);
  }

  getSensedAndOwnedEntities(): Map<string, Entity> {
    return new Map([...this.entities.entries(), ...this.sensedEntities.map.entries()]);
  }

  getWorldScopes(): Map<string, WorldScope> {
    return this.scopesByWorld;
  }

  enqueueAction(action: Action) {
    if(this.client !== undefined) {
      this.broadcastQueue.enqueue(action);
    }
  }

  broadcast() {
    if(this.client !== undefined) {
      let action = this.broadcastQueue.dequeue();
      while(action !== undefined) {
        // TODO batch these
        this.client.broadcast(MessageType.ACTION, action.serialize());
        action = this.broadcastQueue.dequeue();
      }
    }
  }

  handle(phase: string, action: Action) {
    this.components.handle(phase, action);
  }

  disconnect() { }

  ownEntity({ caster, using, entity, metadata }: OwnEntityAction.PlayerParams, force = false): OwnEntityAction {
    return new OwnEntityAction({ caster, using, entity, player: this, metadata });
  }

  _ownEntity(entity: Entity): NestedChanges | undefined {
    // Make sure we don't already own this entity
    if (this.entities.has(entity.id)) {
      return undefined;
    }
    this.entities.set(entity.id, entity);
    const changes = this.sensedEntities.addChild(entity.sensedEntities);
    entity._grantOwnershipTo(this);
    // Modify scope, if appropriate
    if (entity.world) {
      let scope = this.scopesByWorld.get(entity.world.id);
      if (scope) {
        scope.addViewer(entity.id, Chaos.viewDistance, entity.position.toChunkSpace());
      } else {
        scope = entity.world.createScope();
        scope.addViewer(entity.id, Chaos.viewDistance, entity.position.toChunkSpace());
        this.scopesByWorld.set(entity.world.id, scope);
      }
    }
    return changes;
  }

  _disownEntity(entity: Entity): NestedChanges | undefined {
    if (!this.entities.has(entity.id)) {
      return undefined;
    }
    entity.players.delete(this.id);
    this.entities.delete(entity.id);
    entity._revokeOwnershipFrom(this);
    const changes = this.sensedEntities.removeChild(entity.id);
    return changes;
  }
  
  _joinTeam(team: Team): boolean {
    // Make sure we're not already on a team
    if(this.team !== undefined) {
      return false;
    }
    Chaos.playersWithoutTeams.delete(this.id);
    this.team = team;
    team._addPlayer(this);
    return true;
  }

  _leaveTeam(): boolean {
    // Make sure we're on a team in the first place
    if(this.team === undefined) {
      return false;
    }
    this.team._removePlayer(this);
    this.team = undefined;
    Chaos.playersWithoutTeams.set(this.id, this);
    return true;
  }
  
  publish(): PublishPlayerAction {
    return new PublishPlayerAction({ player: this });
  }

  _publish(): boolean {
    if(!Chaos.players.has(this.id)) {
      return false;
    } else {
      Chaos.players.set(this.id, this);
      this.published = true;
      return true;
    }
  }

  _unpublish(): boolean {
    if(!this.published) {
      return false;
    }
    // Disown all entities
    for(const [id, entity] of this.entities) {
      this._disownEntity(entity);
    }
    // Leave the team, if joined
    this._leaveTeam();
    // Remove from Chaos directory
    Chaos.players.delete(this.id);
    this.published = false;
    return true;
  }

  serializeForClient(): Player.SerializedForClient {
    return { id: this.id, username: this.username, admin: this.admin, team: this.team?.id, entities: Array.from(this.entities.keys()) };
  }

}

// tslint:disable-next-line: no-namespace
export namespace Player {
  export interface ConstructorParams {
    id?: string,
    username?: string,
    team?: string,
    admin?: boolean,
    client?: Client
  }

  export interface Serialized {
    id: string,
    entities: string[],
    username: string,
    team: string,
    admin: boolean
  }

  export interface SerializedForClient {
    id: string,
    entities: string[],
    username?: string,
    team?: string,
    admin?: boolean
  }

  export function Deserialize(json: Player.Serialized): Player {
    return new Player(json);
  }

  export function DeserializeAsClient(json: Player.SerializedForClient, owner = false): Player {
    const p = new Player(json);
    // tslint:disable-next-line: forin
    for(const id of json.entities) {
      const entity = Chaos.getEntity(id);
      if(entity === undefined) {
        if(owner) {
          throw new Error('An entity owned by this client was not published with the Player from the server.'); // TODO proper error
        }
      } else {
        p.entities.set(id, entity);
      }
    }
    return p;
  }
}
