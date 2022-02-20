import { Queue } from 'queue-typescript';
import { Stack } from 'stack-typescript';
import { Action, BroadcastType, Chaos, Player, Team, Viewer, UnpublishEntityAction, EffectRunner, ActionEffect, EffectGenerator } from '../internal.js';

export async function processRunner(item: EffectRunner<ActionEffect>, broadcast = false) {
  const followups = new Queue<EffectRunner<ActionEffect>>();
  const immediates = new Stack<EffectGenerator<ActionEffect>>();
  const actionsThisProcess: Action[] = [];
  let current = item.run();
  while (current !== undefined) {
    let effect = current.next().value;
    // Handle whatever effect
    while (effect !== undefined) {
      switch (effect[0]) {
        case 'IMMEDIATE':
          const [,actionOrEvent] = effect;
          // TODO check for length of reactions stack and ignore if too deep?
          immediates.push(current)
          current = effect[1];
          break;
        case 'FOLLOWUP':
          followups.enqueue(effect[1])
          break;
        case 'DELAY':
          // get starting time in ms
          // broadcast
          // delay rest
          // await
        // DECISION
          // broadcast all
          // await decision
        break;
      }
      effect = current.next().value;
    }
    // Track that this action was finished applying and broadcast to hooks that want to read it immediately
    if (current instanceof Action) {
      actionsThisProcess.push(current);
      if (broadcast === true) {
        broadcastToActionHooks(current);
        // TODO queue for broadcast
      }
    }
    // Pop last generator-in-progress OR next followup's generator
    current = immediates.pop() || followups.dequeue().run();
  }
  if (broadcast === true) {
    broadcastToExecutionHooks(actionsThisProcess);

  }
}

function broadcastToActionHooks(action: Action) {
  for (const hook of Chaos.actionHooks) {
    hook(action);
  }
}

function broadcastToExecutionHooks(actionsThisProcess: Action[]) {
  for (const hook of Chaos.executionHooks) {
    hook(actionsThisProcess);
  }
}

function queueForBroadcast(action: Action, to?: Player | Team) {
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
              publishChunks(newChunks, player);
            }
            const newEntities = action.entityVisibilityChanges?.added['player']?.[player.id];
            if (newEntities !== undefined) {
              publishEntities(newEntities, player);
            }
            player.queueForBroadcast(action);
            const oldChunks = action.chunkVisibilityChanges?.removed['player']?.[player.id];
            if (oldChunks !== undefined) {
              publishChunks(oldChunks, player);
            }
            const oldEntities = action.entityVisibilityChanges?.removed['player']?.[player.id];
            if (oldEntities !== undefined) {
              publishEntities(oldEntities, player);
            }
          }
      }
    }
  }
  return;
}

function publishChunks(chunks: Set<string>, to: Viewer) {
  for (const chunk of chunks) {
    const [worldId, x, y] = chunk.split('_');
    if (!worldId || !x || !y) {
      throw new Error(`publishChunks failed -- invalid string ${chunk}`);
    }
    const world = Chaos.getWorld(worldId);
    if (world === undefined) {
      throw new Error(`publishChunks failed -- could not find world ${worldId}`);
    }
    world
  }
}

function unpublishChunks(changes: Set<string>, from: Viewer) {

}

function publishEntities(entities: Set<string>, to: Viewer) {
  for (const id of entities) {
    to.queueForBroadcast(Chaos.getEntity(id)!.getPublishedInPlaceAction());
  }
}

function unpublishEntities(entities: Set<string>, from: Viewer) {
  for (const id of entities) {
    from.queueForBroadcast(new UnpublishEntityAction({ entity: Chaos.getEntity(id)! }));
  }
}

function sendData() {
  for (const [, player] of Chaos.players) {
    player.broadcast();
  }
}

// export class ActionProcessor {
//   queue = new Queue<EffectGenerator<any>>();
//   actionsThisProcess: Action[] = [];
//   processing = false;

//   constructor(private broadcasts: boolean = true) { }

//   enqueue(item: Action | Event) {
//     this.queue.enqueue(item);
//   }

//   reset() {
//     this.queue.reset();
//   }

  // process(action?: Action) {
  //   if (this.processing === true) {
  //     // Reactions fire on their own before the original finishes, so we have to make sure to let hooks see it
  //     if (action?.inReactionTo !== undefined) {
  //       this.actionsThisProcess.push(action);
  //       this.broadcastToActionHooks(action);
  //     }
  //     return;
  //   }
  //   this.processing = true;
  //   let nextAction = this.queue.getNextAction();
  //   while(nextAction !== undefined) {
  //     this.actionsThisProcess.push(nextAction);
  //     nextAction.execute();
  //     this.broadcastToActionHooks(nextAction);
  //     nextAction = this.queue.getNextAction();
  //   }
  //   if (this.actionsThisProcess.length > 0) {
  //     this.broadcastToExecutionHooks();
  //   }
  //   this.sendData(); // TODO make this conditional on server role?
  //   this.actionsThisProcess = [];
  //   this.processing = false;
  // }
// }

