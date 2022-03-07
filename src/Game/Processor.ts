import { Queue } from 'queue-typescript';
import { Stack } from 'stack-typescript';
import {
  Action,
  BroadcastType,
  Chaos,
  Player,
  Team,
  Viewer,
  UnpublishEntityAction,
  EffectRunner,
  ActionEffectGenerator
} from '../internal.js';

export async function processRunner(item: EffectRunner, broadcast = false): Promise<Action[]> {
  const followups = new Queue<EffectRunner>();
  const immediates = new Stack<[EffectRunner, ActionEffectGenerator]>();
  const actionsThisProcess: Action[] = [];
  let currentActionOrEvent: EffectRunner = item;
  let currentGenerator: ActionEffectGenerator = item.run() as ActionEffectGenerator;
  while (currentActionOrEvent !== undefined) {
    let next = currentGenerator.next();
    // Handle whatever effect
    while (next.done === false) {
      const effect = next.value;
      switch (effect[0]) {
        case 'IMMEDIATE':
          const [, actionOrEvent] = effect;
          // TODO check for length of reactions stack and ignore if too deep?
          immediates.push([currentActionOrEvent, currentGenerator]);
          currentActionOrEvent = actionOrEvent;
          currentGenerator = actionOrEvent.run() as ActionEffectGenerator;
          break;
        case 'FOLLOWUP':
          followups.enqueue(effect[1]);
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
      next = currentGenerator.next();
    }
    // Track that this action was finished applying and broadcast to hooks that want to read it immediately
    if (currentActionOrEvent instanceof Action) {
      actionsThisProcess.push(currentActionOrEvent);
      if (broadcast === true) {
        broadcastToActionHooks(currentActionOrEvent);
        queueForBroadcast(currentActionOrEvent);
      }
    }
    // TODO tie queue of actions together here -- in other words let each action know what it actually followed
    // Pop last generator-in-progress OR next followup's generator
    if (immediates.length > 0) {
      [currentActionOrEvent, currentGenerator] = immediates.pop();
    } else {
      currentActionOrEvent = followups.dequeue();
      currentGenerator = currentActionOrEvent?.run() as ActionEffectGenerator;
    }
  }
  if (broadcast === true) {
    broadcastToExecutionHooks(actionsThisProcess);
  }
  sendData();
  return actionsThisProcess;
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
          (action.target &&
            (team.entities.has(action.target.id) || team.sensedEntities.has(action.target.id))) ||
          (action.caster &&
            (team.entities.has(action.caster.id) || team.sensedEntities.has(action.caster.id)))
        ) {
          team.queueForBroadcast(action);
        }
      }
      // TODO players without teams
    } else {
      for (const [, player] of Chaos.players) {
        if (
          (action.target &&
            (player.entities.has(action.target.id) ||
              player.sensedEntities.has(action.target.id))) ||
          (action.caster &&
            (player.entities.has(action.caster.id) || player.sensedEntities.has(action.caster.id)))
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
            unpublishChunks(oldChunks, player);
          }
          const oldEntities = action.entityVisibilityChanges?.removed['player']?.[player.id];
          if (oldEntities !== undefined) {
            unpublishEntities(oldEntities, player);
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
    world;
  }
}

function unpublishChunks(changes: Set<string>, from: Viewer) {}

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
