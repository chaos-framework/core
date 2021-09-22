import {
  Entity, Action, World, Component, Viewer, NestedChanges,
  Player, Team, ActionQueue, ComponentCatalog, ComponentContainer, Scope, BroadcastType,
  CAST
} from "../internal";
import { VisibilityType } from '../Events/Enums';
import { createSecureContext } from "tls";

export let id: string = "Unnamed Game";  // Name of loaded game

export const worlds: Map<string, World> = new Map<string, World>();
export const entities: Map<string, Entity> = new Map<string, Entity>();

export const teams: Map<string, Team> = new Map<string, Team>();
export const teamsByName: Map<string, Team> = new Map<string, Team>();
export const players: Map<string, Player> = new Map<string, Player>();
export const playersWithoutTeams = new Map<string, Player>();

export const actionQueue = new ActionQueue();

export let currentTurn: Entity | Player | Team | undefined = undefined;
export let viewDistance = 6; // how far (in chunks) to load around active entities
export let inactiveViewDistance = 1; // how far (in chunks) to load around inactive entities when they enter an inactive world to check for permissions / modifiers
export let listenDistance = 25; // how far in tiles to let local entities listen to actions around casters and targets
export let perceptionGrouping: 'player' | 'team' = 'player';

// Kind of an ugly way to let the top-level game own components and link into event system
let initialReference: any = {
  id: '___GAMEREF',
  isPublished: () => true,
  sense,
  modify,
  react,
  getComponentContainerByScope: (scope: Scope) => reference
}
export let components: any  = new ComponentCatalog(initialReference); // all components
export const reference: ComponentContainer = {
  ...initialReference,
  components
}

export function reset() {
  entities.clear();
  components.unpublish();
  players.clear();
  playersWithoutTeams.clear();
  teams.clear();
  teamsByName.clear();
  worlds.clear();
  currentTurn = undefined;
}

export function castAsClient(msg: CAST): string | undefined {
  const { casterType, clientId, casterId, using, grantedBy, params } = msg;
  // TODO allow casting as player or team -- for now assuming entity
  if(casterType !== 'entity') {
    return "Invalid caster type. Only Entity currently supported.";
  }
  // Make sure the client exists
  const player = players.get(clientId);
  if(player === undefined) {
    return "Client/Player not found.";
  }
  // Make sure the casting entity exists
  const entity = getEntity(casterId);
  if(entity === undefined) {
    return "Entity not found.";
  }
  // Make sure the player owns the casting entity
  if(!player.owns(entity)) {
    return "You do not have ownership of that entity";
  }
  const event = entity.cast(msg.abilityName, { using, grantedBy, params });
  if(event === undefined) {
    return "Could not cast."
  }
}

export function process() {
  let action = actionQueue.getNextAction();
  while(action !== undefined) {
    action.execute();
    action = actionQueue.getNextAction();
  }
  broadcastAll();
}

export function addWorld(world: World): boolean {
  worlds.set(world.id, world);
  return true;
}

export function getWorld (id: string): World | undefined {
  return worlds.get(id);
}

export function getEntity (id: string): Entity | undefined {
  return entities.get(id);
}

export function addEntity(e: Entity): boolean {
  entities.set(e.id, e);
  if(e.world && worlds.has(e.world.id)) {
    e.world.addEntity(e);
  }
  return true;
}

export function removeEntity(e: Entity): boolean {
  entities.delete(e.id);
  if(e.world) {
    e.world.removeEntity(e);
  }
  return true;
}

export function getComponentContainerByScope(scope: Scope): ComponentContainer | undefined {
  return undefined;
}

export function attach(c: Component): boolean {
  components.addComponent(c);
  return true;
}

export function detach(c: Component): void {
  components.removeComponent(c);
}

export function sense(a: Action): boolean {
  return true;
}

export function senseEntity(e: Entity): boolean {
  return true;
}

export function modify(a: Action) {
  return;
};

export function react(a: Action) {
  return;
};

export function queueActionForProcessing(action: Action) {
  actionQueue.enqueue(action);
}

export function queueForBroadcast(action: Action, to?: Player | Team) {
  // Check if this action contains any visiblity changes and publish/unpublish entities as needed first
  if(action.visibilityChanges !== undefined) {
    publishVisibilityChanges(action.visibilityChanges.changes, action.visibilityChanges.type === 'addition');
  }
  // Check if this message needs to be broadcasted to clients at all
  if(action.broadcastType === BroadcastType.NONE) {
    return;
  } else if (action.broadcastType === BroadcastType.DIRECT) {
    return;
  }
  // Broadcast to everyone, if specified, or more specific clients
  if(action.broadcastType === BroadcastType.FULL) {
    for(const [id, player] of players) {
      player.enqueueAction(action);
    }
  } else {
    // Broadcast out to either visibility type based on sense of relevent entities
    if(perceptionGrouping === 'team') {
      for(const [id, team] of teams) {
        if(
          (action.target && (team.entities.has(action.target.id) || team.sensedEntities.has(action.target.id))) ||
          (action.caster && (team.entities.has(action.caster.id) || team.sensedEntities.has(action.caster.id)))
          ) {
            team.enqueueAction(action);
          }
      }
    } else {
      for(const [id, player] of players) {
        if(
          (action.target && (player.entities.has(action.target.id) || player.sensedEntities.has(action.target.id))) ||
          (action.caster && (player.entities.has(action.caster.id) || player.sensedEntities.has(action.caster.id)))
          ) {
            player.enqueueAction(action);
          }
      }
    }
  }
  return;
}

export function broadcastAll() {
  for(const [id, player] of players) {
    player.broadcast();
  }
}

export function publishVisibilityChanges(changesInVisibility: NestedChanges, addition = true) {
  if(perceptionGrouping === 'team') {
    // TODO
  } else {
    // Broadcast newly visible 
    if(changesInVisibility.changes['player'] !== undefined) {
      const playerChanges = changesInVisibility.changes['player'];
      for(const playerId in playerChanges) {
        const player = players.get(playerId);
        if(player !== undefined && player.client !== undefined) {
          const newEntityIds = changesInVisibility.changes['player'][playerId].values();
          // tslint:disable-next-line: forin
          for(const entityId of newEntityIds) {
            const entity = getEntity(entityId);
            if(entity !== undefined) {
              const action = addition ? entity.getPublishedInPlaceAction() : entity.unpublish();
              player.enqueueAction(action);
            }
          }
        }
      }
    }
  }
}

// Optionally modify underlying serialized method to customize it for a team or player.
// Return undefined if no modification is necessary
export function percieve(a: Action, viewer: Player | Team, visibility: VisibilityType): string | undefined {
  return undefined;
}

export function serializeForScope(viewer: Viewer): SerializedForClient {
  const o: SerializedForClient = { id: id, players: [], teams: [], worlds: [], entities: [] }
  // Serialize all players
  for(const player of players.values()) {
    o.players.push(player.serializeForClient());
  }
  // Serialize all teams
  for(const team of teams.values()) {
    o.teams.push(team.serializeForClient());
  }
  // Gather all visible worlds and serialize with visible baselayer chunks
  for(const kv of viewer.getWorldScopes()) {
    const world = worlds.get(kv[0]);
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

// tslint:disable-next-line: no-namespace
export interface SerializedForClient {
  id: string,
  // config?: any,  // TODO make config interface, GameConfiguration.ts or something
  players: Player.SerializedForClient[],
  teams: Team.SerializedForClient[],
  worlds: World.SerializedForClient[],
  entities: Entity.SerializedForClient[]
}

export function DeserializeAsClient(serialized: SerializedForClient, clientPlayerId: string) {
  for(const team of serialized.teams) {
    const deserialized = Team.DeserializeAsClient(team);
    teams.set(deserialized.id, deserialized);  // TODO addTeam
  }
  for(const entity of serialized.entities) {
    const deserialized = Entity.DeserializeAsClient(entity);
    addEntity(deserialized);
  }
  for(const player of serialized.players) {
    const isOwner = player.id === clientPlayerId;
    const deserialized = Player.DeserializeAsClient(player, isOwner);
    players.set(deserialized.id, deserialized);  // TODO addPlayer..
  }
  for(const world of serialized.worlds) {
    const deserialized = World.deserializeAsClient(world);
    addWorld(deserialized);
  }
}