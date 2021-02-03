import { Action, ActionParameters, World, Vector, IEntity, Game, Entity } from '../../internal';

export class PublishEntityAction extends Action {
  entity: IEntity;
  world: World;
  position: Vector;
  target?: IEntity; // likely unused; if the publishing is a hostile, could be cancelled by target in a meaningful way
  visibilityChangingAction = true;

  constructor({ caster, target, entity, world, position, using, tags }: PublishEntityAction.Params) {
    super({caster, using, tags});
    this.entity = entity;
    this.world = world;
    this.position = position;
    this.target = target;
  }

  initialize() {
    // Ask world to load new chunks if needed.
    this.world.addView(this.entity, this.position.toChunkSpace());
  }

  teardown() {
    // Unload new chunks if needed
    const { id } = this.entity;
    if(!this.entity.active) {
      this.world.removeView(this.entity, this.position.toChunkSpace());
    }
  }

  apply(): boolean {
    this.entity._publish(this.world, this.position);
    return false;
  }

  serialize(): PublishEntityAction.Serialized {
    return {
      ...super.serialize(),
      position: this.position.serialize(),
      world: this.world.id,
      entity: this.entity.id
    };
  };

  static deserialize(json: PublishEntityAction.Serialized): PublishEntityAction {
    const game = Game.getInstance();
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      const entity: IEntity | undefined = game.getEntity(json.entity);  // lol OOPS
      const world: World | undefined = game.worlds.get(json.world);
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
    entity: IEntity,
    world: World,
    position: Vector
  }

  export interface Params extends EntityParams {
    target?: IEntity
  }

  export interface Serialized extends Action.Serialized {
    entity: string;
    world: string;
    position: string;
  }
}
