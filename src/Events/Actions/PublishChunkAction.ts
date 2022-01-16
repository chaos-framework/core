import { Action, ActionType, BroadcastType, ActionParameters, Entity, World, Vector } from '../../internal.js';

export class PublishChunkAction extends Action {
  actionType: ActionType = ActionType.PUBLISH_CHUNK_ACTION;
  broadcastType = BroadcastType.NONE; // TODO only broadcast to owners?

  world: World;
  position: Vector

  constructor({ caster, world, position, using, metadata }: PublishChunkAction.Params) {
    super({ caster, using, metadata });
    this.world = world;
    this.position = position;
  }

  apply() {

    return true;
  }

  serializeForClient() {
    return {
      worldId: this.world.id,
      position: this.position.getIndexString(),
      layers: this.world.serializeChunk(this.position),
      permitted: true,
      actionType: ActionType.PUBLISH_CHUNK_ACTION
    }
  }
}

export namespace PublishChunkAction {
  export interface Params extends ActionParameters {
    caster?: Entity,
    world: World,
    position: Vector
  }

  export interface Serialized extends Action.Serialized {
    worldId: string,
    position: string // vector
  }

  export interface SerializedForClient extends Serialized {
    layers: {
      base: string,
      [key: string]: string
    }
  }
}
