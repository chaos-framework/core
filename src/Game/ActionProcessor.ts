import { Action, Event, ActionQueue, BroadcastType, Chaos, NestedChanges, Player, Team, NestedSetChanges, Viewer, UnpublishEntityAction, VisibilityType, PublishEntityAction } from '../internal.js';

export class ActionProcessor {
  queue = new ActionQueue();
  actionsThisProcess: Action[] = [];
  processing = false;

  enqueue(item: Action | Event) {
    this.queue.enqueue(item);
  }

  reset() {
    this.queue.reset();
  }

  process(action?: Action) {
    if (this.processing === true) {
      // Reactions fire on their own before the original finishes, so we have to make sure to let hooks see it
      if (action?.inReactionTo !== undefined) {
        this.actionsThisProcess.push(action);
        this.broadcastToActionHooks(action);
      }
      return;
    }
    this.processing = true;
    let nextAction = this.queue.getNextAction();
    while(nextAction !== undefined) {
      this.actionsThisProcess.push(nextAction);
      nextAction.execute();
      this.broadcastToActionHooks(nextAction);
      nextAction = this.queue.getNextAction();
    }
    if (this.actionsThisProcess.length > 0) {
      this.broadcastToExecutionHooks();
    }
    this.sendData(); // TODO make this conditional on server role?
    this.actionsThisProcess = [];
    this.processing = false;
  }

  broadcastToActionHooks(action: Action) {
    for (const hook of Chaos.actionHooks) {
      hook(action);
    }
  }

  broadcastToExecutionHooks() {
    for (const hook of Chaos.executionHooks) {
      hook(this.actionsThisProcess);
    }
  }

  queueForBroadcast(action: Action, to?: Player | Team) {
    // TODO ADMIN much easier to push new chunks at game-level
    // Check if this message needs to be broadcasted to clients at all
    if (action.broadcastType === BroadcastType.NONE) {
      return;
    } else if (action.broadcastType === BroadcastType.DIRECT) {
      return;
    }
    // Broadcast to everyone, if specified, or more specific clients
    if (action.broadcastType === BroadcastType.FULL) {
      for (const [, player] of Chaos.players) {
        player.queueForBroadcast(action);
      }
    } else {
      // Broadcast out to either visibility type based on sense of relevent entities
      if (Chaos.perceptionGrouping === 'team') {
        for (const [, team] of Chaos.teams) {
          if (
            (action.target && (team.entities.has(action.target.id) || team.sensedEntities.has(action.target.id))) ||
            (action.caster && (team.entities.has(action.caster.id) || team.sensedEntities.has(action.caster.id)))
            ) {
              team.queueForBroadcast(action);
            }
        }
        // TODO players without teams
      } else {
        for (const [, player] of Chaos.players) {
          if (
            (action.target && (player.entities.has(action.target.id) || player.sensedEntities.has(action.target.id))) ||
            (action.caster && (player.entities.has(action.caster.id) || player.sensedEntities.has(action.caster.id)))
            ) {
              const newChunks = action.chunkVisibilityChanges?.added['player']?.[player.id];
              if (newChunks !== undefined) {
                this.publishChunks(newChunks, player);
              }
              const newEntities = action.entityVisibilityChanges?.added['player']?.[player.id];
              if (newEntities !== undefined) {
                this.publishEntities(newEntities, player);
              }
              player.queueForBroadcast(action);
              const oldChunks = action.chunkVisibilityChanges?.removed['player']?.[player.id];
              if (oldChunks !== undefined) {
                this.publishChunks(oldChunks, player);
              }
              const oldEntities = action.entityVisibilityChanges?.removed['player']?.[player.id];
              if (oldEntities !== undefined) {
                this.publishEntities(oldEntities, player);
              }
            }
        }
      }
    }
    return;
  }

  publishChunks(chunks: Set<string>, to: Viewer) {

  }

  unpublishChunks(changes: Set<string>, from: Viewer) {

  }

  publishEntities(entities: Set<string>, to: Viewer) {
    for (const id of entities) {
      to.queueForBroadcast(Chaos.getEntity(id)!.getPublishedInPlaceAction());
    }
  }

  unpublishEntities(entities: Set<string>, from: Viewer) {
    for (const id of entities) {
      from.queueForBroadcast(new UnpublishEntityAction({ entity: Chaos.getEntity(id)! }));
    }
  }

  sendData() {
    for (const [, player] of Chaos.players) {
      player.broadcast();
    }
  }
}
