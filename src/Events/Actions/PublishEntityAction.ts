import { Action, ActionParameters, World, Vector, Entity, Chaos, ActionType, BroadcastType, NestedSet } from '../../internal.js';

export class PublishEntityAction extends Action {
  actionType: ActionType = ActionType.PUBLISH_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;  // TODO redundant? should never be true

  entity: Entity;
  world: World;
  position: Vector;
  target?: Entity; // likely unused; if the publishing is a hostile, could be cancelled by target in a meaningful way
  movementAction = true;

  temporaryViewer?: NestedSet;

  constructor({ caster, target, entity, world, position, using, metadata }: PublishEntityAction.Params) {
    super({caster, using, metadata });
    this.entity = entity;
    this.world = world;
    this.position = position;
    this.target = target;
    // Let the abstract impl of execute know to let listeners react in the space that this entity has not YET been published
    this.additionalListenPoints = [{ world, position: position }];
  }

  initialize() {
    // Add temporary viewers to chunks in new location
    this.temporaryViewer = this.world.addTemporaryViewer(this.position.toChunkSpace(), this.entity.active);
  }

  teardown() {
    // Unload temporary new chunks
    this.world.removeViewer(this.temporaryViewer!.id);
  }

  apply(): boolean {
    this.chunkVisibilityChanges = this.entity._publish(this.world, this.position) || undefined;
    return true;
  }

  serialize(): PublishEntityAction.Serialized {
    return {
      ...super.serialize(),
      position: this.position.serialize(),
      world: this.world.id,
      entity: this.entity.serializeForClient()
    };
  }
  
  getEntity(): Entity {
    return this.entity;
  }

  static deserialize(json: PublishEntityAction.Serialized): PublishEntityAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      const entity: Entity | undefined = Entity.DeserializeAsClient(json.entity);  // lol OOPS
      const world: World | undefined = Chaos.worlds.get(json.world);
      const position: Vector = Vector.deserialize(json.position);
      // Build the action if fields are proper, otherwise throw an error
      if (entity && world && position) {
        const a = new PublishEntityAction({ ...common, entity, world, position });
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
  export interface EntityParams extends ActionParameters {
    world: World,
    position: Vector
  }

  export interface Params extends EntityParams {
    entity: Entity,
    target?: Entity
  }

  export interface Serialized extends Action.Serialized {
    entity: Entity.SerializedForClient;
    world: string;
    position: string;
  }
}
