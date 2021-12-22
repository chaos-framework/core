import {
  Entity, Action, World, Component, Viewer, ActionProcessor,
  Player, Team, ComponentCatalog, ComponentContainer,
  Scope, VisibilityType, CAST, ExecutionHook, ActionHook
} from "../internal.js";

export let id: string = "Unnamed Game";  // Name of loaded game
export function setId(value: string) { id = value }

export const processor = new ActionProcessor();

let phases = ['modify', 'permit', 'react', 'output']
let prePhases = ['modify', 'permit'];
let postPhases = ['react', 'output'];

export const worlds: Map<string, World> = new Map<string, World>();
export const entities: Map<string, Entity> = new Map<string, Entity>();
export const allComponents: Map<string, Component> = new Map<string, Component>();

export const teams: Map<string, Team> = new Map<string, Team>();
export const teamsByName: Map<string, Team> = new Map<string, Team>();
export const players: Map<string, Player> = new Map<string, Player>();
export const playersWithoutTeams = new Map<string, Player>();

export let actionHooks = new Array<ActionHook>();
export let executionHooks = new Array<ExecutionHook>();

export let currentTurn: Entity | Player | Team | undefined = undefined;
export function setCurrentTurn(to: Entity | Player | Team | undefined) { currentTurn = to }
export let currentTurnSetAt: number = Date.now();
export function setCurrentTurnSetAt(time?: number) { currentTurnSetAt = time !== undefined ? time : Date.now() }

export let viewDistance = 6; // how far (in chunks) to load around active entities
export function setViewDistance(distance: number) { viewDistance = distance; }
export let inactiveViewDistance = 1; // how far (in chunks) to load around inactive entities when they enter an inactive world to check for permissions / modifiers
export let listenDistance = 25; // how far in tiles to let local entities listen to actions around casters and targets
export function setListenDistance(distance: number) { listenDistance = distance; }
export let perceptionGrouping: 'player' | 'team' = 'player';
export function setPerceptionGrouping(value: 'player' | 'team') { perceptionGrouping = value }

// Kind of an ugly way to let the top-level game own components and link into event system
let initialReference: any = {
  id: '___GAMEREF',
  isPublished: () => true,
  getComponentContainerByScope: (scope: Scope) => reference,
  handle: handle
}
export let components = new ComponentCatalog(initialReference); // all components
export const reference: ComponentContainer = {
  ...initialReference,
  components: components
}

export function reset() {
  entities.clear();
  components.clear();
  components.unpublish();
  components.clear();
  players.clear();
  playersWithoutTeams.clear();
  teams.clear();
  teamsByName.clear();
  worlds.clear();
  processor.reset();
  actionHooks = new Array<ActionHook>();
  executionHooks = new Array<ExecutionHook>();
  currentTurn = undefined;
}

export function setPhases(pre: string[], post: string[]) {
  prePhases = pre;
  postPhases = post;
  phases = [...pre, ...post];
}

export function getPhases(): string[] {
  return phases;
}

export function setPrePhases(pre: string[]): void {
  prePhases = pre;
  phases = [...prePhases, ...postPhases];
}

export function setPostPhases(post: string[]): void {
  postPhases = post;
  phases = [...prePhases, ...postPhases];
}

export function getPrePhases(): string[] {
  return prePhases;
}

export function getPostPhases(): string[] {
  return postPhases;
}

export function attachExecutionHook(hook: ExecutionHook) {
  executionHooks.push(hook);
}

export function detachExecutionHook(hook: ExecutionHook) {
  const i = executionHooks.findIndex(existing => existing === hook);
  if (i > -1) {
    executionHooks.splice(i, 1);
  }
}

export function attachActionHook(hook: ActionHook) {
  actionHooks.push(hook);
}

export function detachActionHook(hook: ActionHook) {
  const i = actionHooks.findIndex(existing => existing === hook);
  if (i > -1) {
    actionHooks.splice(i, 1);
  }
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
    e.world.removeEntity(e);  // TODO this should be moved
  }
  return true;
}

export function addPlayer(player: Player) {
  players.set(player.id, player);
}

export function removePlayer(player: Player | string) {
  const id = player instanceof Player ? player.id : player;
  players.delete(id);
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

export function handle(phase: string, action: Action) {
  components.handle(phase, action);
}

export function sense(a: Action): boolean {
  return true;
}

export function senseEntity(e: Entity): boolean {
  return true;
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
  for(const [id, worldScope] of viewer.getWorldScopes()) {
    const world = worlds.get(id);
    if(world !== undefined) {
      o.worlds.push(world.serializeForClient());
    }
  }
  // Gather all entities in sight
  const visibleEntities = viewer.getSensedAndOwnedEntities();
  for(const [, entity] of visibleEntities) {
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
  for(const world of serialized.worlds) {
    const deserialized = World.deserializeAsClient(world);
    addWorld(deserialized);
  }
  for(const entity of serialized.entities) {
    const deserialized = Entity.DeserializeAsClient(entity);
    addEntity(deserialized);
    if(deserialized.world !== undefined) {
      deserialized._publish(deserialized.world, deserialized.position);
    }
  }
  for(const player of serialized.players) {
    const isOwner = player.id === clientPlayerId;
    const deserialized = Player.DeserializeAsClient(player, isOwner);
    addPlayer(deserialized);
  }
}
