import {
  Action,
  ActionType,
  BroadcastType,
  ActionParameters,
  Entity,
  World,
  Vector,
  Chaos,
  ActionEffectGenerator
} from '../../internal.js'

export class PublishChunkAction extends Action {
  actionType: ActionType = ActionType.PUBLISH_CHUNK_ACTION
  broadcastType = BroadcastType.NONE // TODO only broadcast to owners?

  world: World
  position: Vector

  data?: any

  constructor({
    caster,
    world,
    position,
    using,
    metadata
  }: PublishChunkAction.Params) {
    super({ caster, using, metadata })
    this.world = world
    this.position = position
  }

  *apply(): ActionEffectGenerator {
    return true
  }

  serializeForClient(): PublishChunkAction.SerializedForClient {
    return {
      worldId: this.world.id,
      position: this.position.getIndexString(),
      layerData: this.world.serializeChunk(this.position),
      permitted: true,
      actionType: ActionType.PUBLISH_CHUNK_ACTION
    }
  }

  static deserializeAsClient(json: PublishChunkAction.SerializedForClient) {
    const world = Chaos.getWorld(json.worldId)
    if (world === undefined) {
      throw new Error(
        `Could not find world ID ${json.worldId} when publishing chunk.`
      )
    }
    const position = Vector.fromIndexString(json.position)
    if (!world.hasChunk(position.x, position.y)) {
      world.initializeChunk(position.x, position.y, json.layerData)
    }
  }
}

export namespace PublishChunkAction {
  export interface Params extends ActionParameters {
    caster?: Entity
    world: World
    position: Vector
  }

  export interface Serialized extends Action.Serialized {
    worldId: string
    position: string // vector
  }

  export interface SerializedForClient extends Serialized {
    layerData: {
      base: string
      [key: string]: string
    }
  }
}
