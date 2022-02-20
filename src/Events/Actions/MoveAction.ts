import {
  Action,
  ActionParameters,
  Entity,
  Chaos,
  ActionType,
  Vector,
  BroadcastType,
  Viewer,
  NestedSetChanges,
  ActionEffectGenerator
} from '../../internal.js'

export class MoveAction extends Action {
  actionType: ActionType = ActionType.MOVE_ACTION
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY

  target: Entity
  from: Vector
  to: Vector
  movementAction = true
  chunkVisibilityChanges = new NestedSetChanges()

  constructor({ caster, target, to, using, metadata }: MoveAction.Params) {
    super({ caster, using, metadata })
    this.target = target
    this.from = target.position
    this.to = to
    // Let the abstract impl of execute know to let listeners react in the space that this entity has not YET moved to
    if (this.target.world !== undefined) {
      this.additionalListenPoints = [{ world: this.target.world, position: to }]
    }
  }

  *apply(): ActionEffectGenerator {
    return this.target._move(this.to, this.chunkVisibilityChanges)
  }

  initialize() {
    // Ask world to load new chunks if needed.
    const { from, to, target } = this
    const { world } = target
    if (world && from.differentChunkFrom(to)) {
      // TODO SCOPE
      // world.addView(target, to.toChunkSpace(), from.toChunkSpace());
    }
  }

  teardown() {
    const { world } = this.target
    if (world && this.from.differentChunkFrom(this.to)) {
      // Check if this entity is active, and therefore needs to persist the world around it
      // Also check if action was permitted. If so, remove old view. If neither is true, just remove old.
      if (this.target.active && this.applied) {
        //   world.removeView(this.target, this.from.toChunkSpace(), this.to.toChunkSpace());
        // } else {
        //   world.removeView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
      }
    }
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    // TODO SCOPE
    return false
  }

  // See if this is moving into a circle from outside
  movesInto(origin: Vector, radius: number): boolean {
    return (
      !this.from.withinRadius(origin, radius) &&
      this.to.withinRadius(origin, radius)
    )
  }

  // See if this is moving out of a circle from inside
  movesOutOf(origin: Vector, radius: number): boolean {
    return (
      this.from.withinRadius(origin, radius) &&
      !this.to.withinRadius(origin, radius)
    )
  }

  serialize(): MoveAction.Serialized {
    return {
      ...super.serialize(),
      to: this.to.serialize(),
      target: this.target.id
    }
  }

  static deserialize(json: MoveAction.Serialized): MoveAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json)
      // Deserialize unique fields
      const { target } = common
      const to: Vector = Vector.deserialize(json.to)
      // Build the action if fields are proper, otherwise throw an error
      if (target !== undefined && to) {
        const a = new MoveAction({ ...common, target, to })
        return a
      } else {
        throw new Error('MoveAction fields not correct.')
      }
    } catch (error) {
      throw error
    }
  }
}

// tslint:disable-next-line: no-namespace
export namespace MoveAction {
  export interface Params extends EntityParams {
    target: Entity
  }

  export interface EntityParams extends ActionParameters {
    to: Vector
  }

  export interface EntityRelativeParams extends ActionParameters {
    amount: Vector
  }

  export interface Serialized extends Action.Serialized {
    target: string
    to: string
  }
}
