import {
  Entity, Action, World, Component, ComponentContainer,
  Listener, Modifier, Reacter, isModifier, isReacter,
  Player, Team
} from "../internal";
import { VisibilityType } from '../Events/Enums';
import ActionQueue from "../Events/ActionQueue";
import { Broadcaster } from ".";
import { fromPairs } from "lodash";

export default abstract class Game implements Broadcaster {
  private static instance: Game;

  worlds: Map<string, World> = new Map<string, World>();
  entities: Map<string, Entity> = new Map<string, Entity>();

  teams: Map<string, Team> = new Map<string, Team>();
  players: Map<string, Player> = new Map<string, Player>();

  components: Component[] = []; // all components
  modifiers: Modifier[] = [];   // all modifiers
  reacters: Reacter[] = [];     // all reacters

  actionQueue = new ActionQueue();

  viewDistance = 6; // how far (in chunks) to load around active entities
  inactiveViewDistance = 0; // how far (in chunks) to load around inactive entities when leaving active world
  perceptionGrouping: "player" | "team" = "player";

  constructor(options: any) {
    if (Game.instance && !process.env.DEBUG) {
      throw new Error();
    }
    Game.instance = this;
    this.initialize(options);
  }

  static getInstance = (): Game => {
    if (Game.instance) {
      return Game.instance;
    }
    throw new Error();
  }

  enqueueAction = (a: Action): void => {
    //this.actionQueue.enqueue(a);
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

  addEntity = (e: Entity): boolean => {
    if (e.id) {
      this.entities.set(e.id, e);
      return true;
    }
    return false;
  }

  attach(c: Component): boolean {
    this.components.push(c); // TODO check for unique flag, return false if already attached
    if (isModifier(c)) {
      this.modifiers.push(c);
    }
    if (isReacter(c)) {
      this.reacters.push(c);
    }
    return true;
  }

  detach(c: Component): void {
    // TODO
  }

  modify(a: Action) {
    this.modifiers.map(r => r.modify(a));
  }

  react(a: Action) {
    this.reacters.map(r => r.react(a));
  }

  queueForBroadcast(a: Action) {
    // Check what the perception level is, ie do teams percieve actions as a whole or individual players?
    if (this.perceptionGrouping === 'team') {
      // Loop through teams and broadcast if visible
      for (const team of this.teams.values()) {
        // See if the visibility algorithm can decide visibility at the team level
        let visibility: VisibilityType = this.getVisibilityToTeam(a, team);
        if (visibility !== VisibilityType.DEFER) {
          this.percieveAndBroadcast(a, team, visibility);
        }
        // If deferred, we have to check at the player level and take the highest visibility found, or break on fully visible
        visibility = VisibilityType.DEFER;
        for (const playerId in team.players) {
          const player = this.players.get(playerId);
          if (player) {
            const playerVisibility = this.getVisibilityToPlayer(a, player);
            if(playerVisibility > visibility) {
              visibility = playerVisibility;
            }
            if(playerVisibility === VisibilityType.VISIBLE) {
              break;
            }
          }
        }
        if(visibility !== VisibilityType.DEFER) {
          this.percieveAndBroadcast(a, team, visibility);
        }
        // If deferred again, check for visibility on each individual entity
        // Note that we don't use DEFER, since it's not possible to defer any further
        visibility = VisibilityType.NOT_VISIBLE;
        for (const entityId in team.entities) {
          const entity = this.entities.get(entityId);
          if (entity) {
            const entityVisibility = this.getVisibilityToEntity(a, entity);
            if(entityVisibility > visibility) {
              visibility = entityVisibility;
            }
            if(entityVisibility === VisibilityType.VISIBLE) {
              break;
            }
          }
        }
        this.percieveAndBroadcast(a, team, visibility);
      }
      // Check if this is cast on or by a team member

    } else { // 'player'

    }
  }

  percieveAndBroadcast(a: Action, viewer: Player | Team, visibility: VisibilityType) {
    const serializedNormally = a.serialize(true);
    // TODO percieve
    // TODO publish if needed
    // TODO broadcast action
    // TODO unpublish if needed
  }

  percieve(a: Action, viewer: Player | Team, visibility: VisibilityType): string {
    return a.serialize(true);
  }

  getVisibilityToTeam(a: Action, t: Team): VisibilityType {
    return VisibilityType.VISIBLE;
  }

  getVisibilityToPlayer(a: Action, p: Player): VisibilityType {
    return VisibilityType.VISIBLE;
  }

  getVisibilityToEntity(a: Action, e: Entity): VisibilityType {
    return VisibilityType.VISIBLE;
  }

  abstract initialize(options: any): void;
  abstract onPlayerConnect(p: Player, options: any): void;
  abstract onPlayerDisconnect(options: any): void;

}
