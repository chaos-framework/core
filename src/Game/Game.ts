import {
  Entity,
  Action, World, Component, Viewer, NestedChanges,
  Player, Team, ActionQueue, ComponentCatalog, ComponentContainer, ClientGame, Scope
} from "../internal";
import { VisibilityType } from '../Events/Enums';
import { CONNECTION, CONNECTION_RESPONSE } from "../ClientServer/Message";
import { MessageType } from "../ClientServer/Messages/Types";

export abstract class Game implements ComponentContainer {
  static instance: Game;
  id: string = "New Game";

  worlds: Map<string, World> = new Map<string, World>();
  entities: Map<string, Entity> = new Map<string, Entity>();

  teams: Map<string, Team> = new Map<string, Team>();
  teamsByName: Map<string, Team> = new Map<string, Team>();
  players: Map<string, Player> = new Map<string, Player>();
  playersWithoutTeams = new Map<string, Player>();

  components: ComponentCatalog = new ComponentCatalog(this); // all components

  actionQueue = new ActionQueue();

  viewDistance = 6; // how far (in chunks) to load around active entities
  inactiveViewDistance = 1; // how far (in chunks) to load around inactive entities when they enter an inactive world to check for permissions / modifiers
  listenDistance = 25; // how far in tiles to let local entities listen to actions around casters and targets
  perceptionGrouping: 'player' | 'team' = 'player';

  constructor(options?: any) {
    if (Game.instance && !process.env.DEBUG) {
      throw new Error();
    }
    Game.instance = this;
  }

  static getInstance = (): Game => {
    if (Game.instance) {
      return Game.instance;
    }
    throw new Error();
  }

  // process = (command: Command): boolean => {
  //   const { player: playerId, entity: entityId, params } = command;
  //   // See if the player exists
  //   const player = this.players.get(command.player);
  //   if(player === undefined) {
  //     return false;
  //   }
  //   // See if the entity is specified, and if the player has rights on it
  //   let entity;
  //   if(command.entity) {
  //     entity = this.getEntity(command.entity);
  //     if(entity === undefined) {
  //       return false;
  //     }
  //   }
  //   this.actionQueue.enqueue(a);
  //   return true;
  // }

  process() {
    let action = this.actionQueue.getNextAction();
    while(action !== undefined) {
      action.execute();
      action = this.actionQueue.getNextAction();
    }
    this.broadcastAll();
  }

  addWorld = (world: World): boolean => {
    this.worlds.set(world.id, world);
    return true;
  }

  getWorld = (id: string): World | undefined => {
    return this.worlds.get(id);
  }

  getEntity = (id: string): Entity | undefined => {
    return this.entities.get(id);
  }

  addEntity(e: Entity): boolean {
    this.entities.set(e.id, e);
    if(e.world && this.worlds.has(e.world.id)) {
      e.world.addEntity(e);
    }
    return true;
  }

  removeEntity(e: Entity): boolean {
    this.entities.delete(e.id);
    if(e.world) {
      e.world.removeEntity(e);
    }
    return true;
  }

  isPublished() {
    return true; // needed for an interface..
  }

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
    return undefined;
  }

  attach(c: Component): boolean {
    this.components.addComponent(c);
    return true;
  }

  detach(c: Component): void {
    this.components.removeComponent(c);
  }
  
  sense(a: Action): boolean {
    return true;
  }

  senseEntity(e: Entity): boolean {
    return true;
  }

  modify(a: Action) {
    return;
  };

  react(a: Action) {
    return;
  };

  queueActionForProcessing(action: Action) {
    this.actionQueue.enqueue(action);
  }

  queueForBroadcast(action: Action, to?: Player | Team) {
    // check if this is a direct console message
     if(to !== undefined) {
       // bleh
       return;
     }
    // Check if this action contains any visiblity changes and publish/unpublish entities as needed
    if(action.visibilityChanges !== undefined) {
      this.publishVisibilityChanges(action.visibilityChanges.changes, action.visibilityChanges.type === 'addition');
    }
    // Broadcast out to either visibility type
    if(this.perceptionGrouping === 'team') {
      for(const [id, team] of this.teams) {
        if(
          (action.target && (team.entities.has(action.target.id) || team.sensedEntities.has(action.target.id))) ||
          (action.caster && (team.entities.has(action.caster.id) || team.sensedEntities.has(action.caster.id)))
          ) {
            team.enqueueAction(action);
          }
      }
    } else {
      for(const [id, player] of this.players) {
        if(
          (action.target && (player.entities.has(action.target.id) || player.sensedEntities.has(action.target.id))) ||
          (action.caster && (player.entities.has(action.caster.id) || player.sensedEntities.has(action.caster.id)))
          ) {
            player.enqueueAction(action);
          }
      }
    }
    return;
  }

  broadcastAll() {
    for(const [id, player] of this.players) {
      player.broadcast();
    }
  }

  publishVisibilityChanges(changesInVisibility: NestedChanges, addition = true) {
    if(this.perceptionGrouping === 'team') {
      // TODO
    } else {
      // Broadcast newly visible 
      if(changesInVisibility.changes['player'] !== undefined) {
        const players = changesInVisibility.changes['player'];
        for(const playerId in players) {
          const player = this.players.get(playerId);
          if(player !== undefined && player.client !== undefined) {
            const newEntityIds = changesInVisibility.changes['player'][playerId].keys;
            // tslint:disable-next-line: forin
            for(const entityId in newEntityIds) {
              const entity = this.getEntity(entityId);
              if(entity !== undefined) {
                const action = addition ? entity.getPublishedInPlaceAction() : entity.unpublish();
                player.client.broadcast(MessageType.ACTION, action);
              }
            }
          }
        }
      }
    }
  }

  // Optionally modify underlying serialized method to customize it for a team or player.
  // Return undefined if no modification is necessary
  percieve(a: Action, viewer: Player | Team, visibility: VisibilityType): string | undefined {
    return undefined;
  }

  abstract onPlayerConnect(msg: CONNECTION): CONNECTION_RESPONSE;
  abstract onPlayerDisconnect(options: any): void;  // TODO solidify disconnection options w/ interface in ClientServer

  serializeForScope(viewer: Viewer): Game.SerializedForClient {
    const o: Game.SerializedForClient = { id: this.id, players: [], teams: [], worlds: [], entities: [] }
    // Serialize all players
    for(let player of this.players.values()) {
      o.players.push(player.serializeForClient());
    }
    // Serialize all teams
    for(let team of this.teams.values()) {
      o.teams.push(team.serializeForClient());
    }
    // Gather all visible worlds and serialize with visible baselayer chunks
    for(let kv of viewer.getWorldScopes()) {
      const world = this.worlds.get(kv[0]);
      if(world !== undefined) {
        o.worlds.push(world.serializeForClient());
      }
    }
    // Gather all entities in sight
    const visibleEntities = viewer.getSensedAndOwnedEntities();
    for(const [id, entity] of visibleEntities) {
      o.entities.push(entity.serializeForClient());
    }
    return o;
  }
}

// tslint:disable-next-line: no-namespace
export namespace Game {
  export interface SerializedForClient {
    id: string,
    // config?: any,  // TODO make config interface, GameConfiguration.ts or something
    players: Player.SerializedForClient[],
    teams: Team.SerializedForClient[],
    worlds: World.SerializedForClient[],
    entities: Entity.SerializedForClient[]
  }

  export function DeserializeAsClient(serialized: Game.SerializedForClient, clientPlayerId: string): ClientGame {
    const game = new ClientGame();
    for(let team of serialized.teams) {
      const deserialized = Team.DeserializeAsClient(team);
      game.teams.set(deserialized.id, deserialized);  // TODO addTeam
    }
    for(let entity of serialized.entities) {
      const deserialized = Entity.DeserializeAsClient(entity);
      game.addEntity(deserialized);
    }
    for(let player of serialized.players) {
      const isOwner = player.id === clientPlayerId;
      const deserialized = Player.DeserializeAsClient(player, isOwner);
      game.players.set(deserialized.id, deserialized);  // TODO addPlayer..
    }
    for(let world of serialized.worlds) {
      const deserialized = World.deserializeAsClient(world);
      game.addWorld(deserialized);
    }
    return game;
  }
}
