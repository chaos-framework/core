import { Action, Event, ActionQueue, BroadcastType, Chaos, NestedChanges, Player, Team, NestedSetChanges } from '../internal.js';

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
    if(this.processing === true) {
      // Reactions fire on their own before the original finishes, so we have to make sure to let hooks see it
      if(action?.inReactionTo !== undefined) {
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
    if(this.actionsThisProcess.length > 0) {
      this.broadcastToExecutionHooks();
    }
    this.broadcastAll(); // TODO make this conditional on server role?
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
    // TODO SCOPE publish new chunks and entities
    // Check if this message needs to be broadcasted to clients at all
    if(action.broadcastType === BroadcastType.NONE) {
      return;
    } else if (action.broadcastType === BroadcastType.DIRECT) {
      return;
    }
    // Broadcast to everyone, if specified, or more specific clients
    if(action.broadcastType === BroadcastType.FULL) {
      for(const [, player] of Chaos.players) {
        player.enqueueAction(action);
      }
    } else {
      // Broadcast out to either visibility type based on sense of relevent entities
      if(Chaos.perceptionGrouping === 'team') {
        for(const [, team] of Chaos.teams) {
          if(
            (action.target && (team.entities.has(action.target.id) || team.sensedEntities.has(action.target.id))) ||
            (action.caster && (team.entities.has(action.caster.id) || team.sensedEntities.has(action.caster.id)))
            ) {
              team.enqueueAction(action);
            }
        }
        // TODO players without teams
      } else {
        for(const [, player] of Chaos.players) {
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

  publishNewChunks(changes: NestedSetChanges) {

  }

  unpublishOldChunks(changes: NestedSetChanges) {

  }

  publishNewEntities(changes: NestedChanges) {

  }

  publishOldEntities(changes: NestedChanges) {

  }

  publishVisibilityAdditions(chunkChanges: NestedSetChanges, entityChanges: NestedChanges) {
    // if(Chaos.perceptionGrouping === 'team') {
    //   // TODO
    // } else {
    //   // Broadcast newly visible 
    //   if(changesInVisibility.changes['player'] !== undefined) {
    //     const playerChanges = changesInVisibility.changes['player'];
    //     for(const playerId in playerChanges) {
    //       const player = Chaos.players.get(playerId);
    //       if(player !== undefined && player.client !== undefined) {
    //         const newEntityIds = changesInVisibility.changes['player'][playerId].values();
    //         // tslint:disable-next-line: forin
    //         for(const entityId of newEntityIds) {
    //           const entity = Chaos.getEntity(entityId);
    //           if(entity !== undefined) {
    //             const action = addition ? entity.getPublishedInPlaceAction() : entity.unpublish();
    //             player.enqueueAction(action);
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }

  broadcastAll() {
    for(const [, player] of Chaos.players) {
      player.broadcast();
    }
  }
}