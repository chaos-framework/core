import {
  Action,
  ActionType,
  BroadcastType,
  ActionParameters,
  Entity,
  World,
  Vector,
  Chaos,
  ProcessEffectGenerator
} from '../../internal.js';

export class PublishChunkAction extends Action<World> {
  actionType: ActionType = ActionType.PUBLISH_CHUNK_ACTION;
  broadcastType = BroadcastType.NONE; // TODO only broadcast to owners?

  target: World;
  position: Vector;

  data?: any;

  constructor({ caster, target, position, using, metadata }: PublishChunkAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.position = position;
  }

  async *apply(): ProcessEffectGenerator {
    return true;
  }

  serializeForClient(): PublishChunkAction.SerializedForClient {
    return {
      worldId: this.target.id,
      position: this.position.getIndexString(),
      layerData: this.target.serializeChunk(this.position),
      permitted: true,
      actionType: ActionType.PUBLISH_CHUNK_ACTION
    };
  }

  static deserializeAsClient(json: PublishChunkAction.SerializedForClient) {
    const world = Chaos.getWorld(json.worldId);
    if (world === undefined) {
      throw new Error(`Could not find world ID ${json.worldId} when publishing chunk.`);
    }
    const position = Vector.fromIndexString(json.position);
    if (!world.hasChunk(position.x, position.y)) {
      world.initializeChunk(position.x, position.y, json.layerData);
    }
  }
}

export namespace PublishChunkAction {
  export interface Params extends ActionParameters<World> {
    caster?: Entity;
    target: World;
    position: Vector;
  }

  export interface Serialized extends Action.Serialized {
    worldId: string;
    position: string; // vector
  }

  export interface SerializedForClient extends Serialized {
    layerData: {
      base: string;
      [key: string]: string;
    };
  }
}
