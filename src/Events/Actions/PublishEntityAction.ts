import { Action, ActionParameters, World, Vector, Entity } from '../../internal';

export class PublishEntityAction extends Action {
  entity: Entity;
  world: World;
  position: Vector;
  target?: Entity; // likely unused; if the publishing is a hostile, could be cancelled by target in a meaningful way
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

}

export namespace PublishEntityAction {
  export interface EntityParams extends ActionParameters {
    entity: Entity,
    world: World,
    position: Vector
  }

  export interface Params extends EntityParams {
    target?: Entity
  }
}
