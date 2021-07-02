import { Queue } from 'queue-typescript';
import { v4 as uuid } from 'uuid';
import { MessageType } from '../ClientServer/Messages/Types';
import { OwnEntityAction } from '../Events/Actions/OwnEntityAction';
import { Game, Team, Action, Entity, WorldScope, Client, NestedMap, PublishPlayerAction } from '../internal';
import { VisibilityType } from '../internal';
import { NestedChanges } from '../Util/NestedMap';
import { Viewer, ActionQueuer } from './Interfaces';

export class Player implements Viewer, ActionQueuer {
  id: string = uuid();
  client?: Client;
  username: string;

  teams: NestedMap<Team>;    // teams this player belongs to
  entities: NestedMap<Entity>; // entities this player "owns"

  admin = false;
  scopesByWorld: Map<string, WorldScope>;
  
  sensedEntities: NestedMap<Entity>;

  broadcastQueue = new Queue<Action>();

  constructor({ id = uuid(), username, teams = [], admin = false, client }: Player.ConstructorParams) {
    this.id = id;
    this.username = username ? username: this.id.substring(this.id.length - 6);
    this.admin = admin;
    this.client = client;
    const game = Game.getInstance();
    this.teams = new NestedMap<Team>(this.id, 'player')
    this.entities = new NestedMap<Entity>(this.id, 'player')
    this.sensedEntities = new NestedMap<Entity>(id, 'player');
    // Make sure that we weren't passed an array of teams if the game's perceptionGrouping is 'team'
    // This is because you can't (yet) meaningfully share a scope with multiple teams
    if (teams.length > 1 && game.perceptionGrouping === 'team') {
      throw new Error('Cannot join multiple teams with team-level visibility'); // TODO ERROR
    }
    // Make sure the team(s) exists
    for (const teamId of teams) {
      const team = game.teams.get(teamId);
      if (team === undefined) {
        throw new Error('Team not found for player to join'); // TODO ERROR
      }
      this.teams.add(teamId, team);
      team._addPlayer(this);
    }
    // If game is has team visibility and assigned to a (single) team, reference that team's scope directly
    if (game.perceptionGrouping === 'team' && this.teams.map.size === 1) {
      const team = this.teams.map.values().next().value;
      this.scopesByWorld = team.scopesByWorld;
    } else {
      this.scopesByWorld = new Map<string, WorldScope>();
    }
    game.players.set(this.id, this);
    // If this player is not part of any teams indicate so in the game
    if (this.teams.map.size === 0) {
      game.playersWithoutTeams.set(this.id, this);
    }
  }

  owns(entity: Entity | string): boolean {
    return this.entities.has(entity instanceof Entity ? entity.id : entity);
  }

  getSensedAndOwnedEntities(): Map<string, Entity> {
    return new Map([...this.entities.map.entries(), ...this.sensedEntities.map.entries()]);
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

  disconnect() { }

  ownEntity({caster, using, entity, tags}: OwnEntityAction.PlayerParams, force = false): OwnEntityAction {
    return new OwnEntityAction({ caster, using, entity, player: this, tags});
  }

  _ownEntity(entity: Entity): NestedChanges {
    // Make sure we don't already own this entity
    if(this.entities.has(entity.id)) {
      return new NestedChanges();
    }
    this.entities.add(entity.id, entity);
    const changes = this.sensedEntities.addChild(entity.sensedEntities);
    entity.teams.addChild(this.teams);
    entity.owners.add(this.id);
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
    return changes;
  }

  _disownEntity(entity: Entity): NestedChanges {
    entity.owners.delete(this.id);
    const changes = this.sensedEntities.removeChild(entity.id);
    this.entities.remove(entity.id);
    entity.teams.removeChild(this.id);
    return changes;
  }

  _joinTeam(team: Team): boolean {
    // Make sure we're not already in this team
    if(this.teams.has(team.id)) {
      return false;
    }
    if (Game.getInstance().perceptionGrouping === 'team' || this.teams.has(team.id)) {
      return false;
    }
    this.teams.add(team.id, team);
    this.entities.addParent(team.entities);  // add nested map relationship
    this.sensedEntities.addParent(team.sensedEntities);
    if (this.teams.map.size === 1) {
      Game.getInstance().playersWithoutTeams.delete(this.id);
    }
    return true;
  }

  _leaveTeam(team: Team): boolean {
    // Make sure we're in this team
    if(!this.teams.has(team.id)) {
      return false;
    }
    if (Game.getInstance().perceptionGrouping === 'team' || !this.teams.has(team.id)) {
      return false;
    }
    this.teams.remove(team.id);
    this.entities.removeParent(team.id); // detach nestedmap entity relationship
    this.sensedEntities.removeParent(team.id)
    if (this.teams.map.size === 0) {
      Game.getInstance().playersWithoutTeams.set(this.id, this);
    }
    return true;
  }
  
  publish(): PublishPlayerAction {
    return new PublishPlayerAction({ player: this });
  }

  serializeForClient(): Player.SerializedForClient {
    return { id: this.id, username: this.username, admin: this.admin, teams: Array.from(this.teams.map.keys()), entities: Array.from(this.entities.map.keys()) };
  }

}

// tslint:disable-next-line: no-namespace
export namespace Player {
  export interface ConstructorParams {
    id?: string,
    username?: string,
    teams?: string[],
    admin?: boolean,
    client?: Client
  }

  export interface Serialized {
    id: string,
    entities: string[],
    username: string,
    teams: string[],
    admin: boolean
  }

  export interface SerializedForClient {
    id: string,
    entities: string[],
    username?: string,
    teams?: string[],
    admin?: boolean
  }

  export function Deserialize(json: Player.Serialized): Player {
    return new Player(json);
  }

  export function DeserializeAsClient(json: Player.SerializedForClient, owner = false): Player {
    const p = new Player(json);
    const game = Game.getInstance();
    p.entities = new NestedMap<Entity>(p.id, 'player');
    // tslint:disable-next-line: forin
    for(const id of json.entities) {
      const entity = game.getEntity(id);
      if(entity === undefined) {
        if(owner) {
          throw new Error('An entity owned by this client was not published with the Player from the server.'); // TODO proper error
        }
      } else {
        p.entities.add(id, entity);
      }
    }
    return p;
  }
}
