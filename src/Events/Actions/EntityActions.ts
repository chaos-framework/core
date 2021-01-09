import Component from '../../EntityComponent/Component';
import Entity from '../../EntityComponent/Entity';
import Vector from '../../Math/Vector';
import World from '../../World/World';
import Action, { ActionParameters } from '../Action'

export class PublishEntityAction extends Action {
  entity: Entity;
  world: World;
  position: Vector;
  target?: Entity; // likely unused; if the publishing is a hostile, could be cancelled by target in a meaningful way

  constructor({ caster, target, entity, world, position, using, tags }: PublishEntityAction.Params) {
    super({caster, using, tags});
    this.entity = entity;
    this.world = world;
    this.position = position;
    this.target = target;
  }

  initialize() {
    // Ask world to load new chunks if needed.
    const { id } = this.entity;
    this.world.preload(id, this.position.toChunkSpace());
  }

  apply(): boolean {
    this.entity._publish(this.world, this.position);
    return false;
  }

}

export namespace PublishEntityAction {
  export interface Params extends ActionParameters {
    entity: Entity,
    world: World,
    position: Vector,
    target?: Entity
  }
}

// TODO unpublish
// TODO replace (with same ID)? could be handy if you need to swap one entity with another.. allow for more specific modification/reaction