import {
  Action,
  ActionParameters,
  World,
  Vector,
  Entity,
  Chaos,
  ActionType,
  BroadcastType,
  NestedSet,
  NestedSetChanges,
  ProcessEffectGenerator
} from '../../internal.js';

export class PublishEntityAction extends Action<Entity> {
  actionType: ActionType = ActionType.PUBLISH_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY; // TODO redundant? should never be true

  target: Entity;
  world: World;
  position: Vector;
  movementAction = true;

  temporaryViewer?: NestedSet;
  chunkVisibilityChanges = new NestedSetChanges();

  constructor({ caster, target, world, position, using, metadata }: PublishEntityAction.Params) {
    super({ caster, using, metadata });
    this.world = world;
    this.position = position;
    this.target = target;
    // Let the abstract impl of execute know to let listeners react in the space that this entity has not YET been published
    this.additionalListenPoints = [{ world, position: position }];
  }

  initialize() {
    // Add temporary viewers to chunks in new location
    this.temporaryViewer = this.world.addTemporaryViewer(
      this.position.toChunkSpace(),
      this.target.active,
      this.chunkVisibilityChanges
    );
  }

  teardown() {
    // Unload temporary new chunks
    this.world.removeViewer(this.temporaryViewer!.id, this.chunkVisibilityChanges);
  }

  async *apply(): ProcessEffectGenerator {
    return this.target._publish(this.world, this.position, this.chunkVisibilityChanges);
  }

  serialize(): PublishEntityAction.Serialized {
    return {
      ...super.serialize(),
      position: this.position.serialize(),
      world: this.world.id,
      target: this.target.serializeForClient()
    };
  }

  getEntity(): Entity {
    return this.target;
  }

  static deserialize(json: PublishEntityAction.Serialized): PublishEntityAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      const target: Entity | undefined = Entity.DeserializeAsClient(json.target); // lol OOPS
      const world: World | undefined = Chaos.worlds.get(json.world);
      const position: Vector = Vector.deserialize(json.position);
      // Build the action if fields are proper, otherwise throw an error
      if (target && world && position) {
        const a = new PublishEntityAction({
          ...common,
          target,
          world,
          position
        });
        return a;
      } else {
        throw new Error('PublishEntityAction fields not correct.');
      }
    } catch (error) {
      throw error;
    }
  }
}

export namespace PublishEntityAction {
  export interface EntityParams extends ActionParameters<Entity> {
    world: World;
    position: Vector;
  }

  export interface Params extends EntityParams {
    target: Entity;
  }

  export interface Serialized extends Action.Serialized {
    target: Entity.SerializedForClient;
    world: string;
    position: string;
  }
}
