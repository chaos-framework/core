import { Viewer } from '../../Game/Interfaces';
import { Action, ActionParameters, Entity, Game, MessageType, Vector } from '../../internal';

export class MoveAction extends Action {
  messageType: MessageType = MessageType.MOVE_ACTION;

  target: Entity;
  from: Vector;
  to: Vector;
  movementAction = true;

  constructor({ caster, target, to, using, tags = [] }: MoveAction.Params) {
    super({ caster, using, tags });
    this.target = target;
    this.from = target.position;
    this.to = to;
  }

  apply(): boolean {
    return this.target._move(this.to);
  }

  initialize() {
    // Ask world to load new chunks if needed.
    const { world } = this.target;
    if (world && this.from.differentChunkFrom(this.to)) {
      world.addView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
    }
  }

  teardown() {
    const { world } = this.target;
    if (world && this.from.differentChunkFrom(this.to)) {
      // Check if this entity is active, and therefore needs to persist the world around it
      // Also check if action was permitted. If so, remove old view. If neither is true, just remove old.
      if (this.target.active && this.permitted) {
        world.removeView(this.target, this.from.toChunkSpace(), this.to.toChunkSpace());
      } else {
        world.removeView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
      }
    }
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    if (super.isInPlayerOrTeamScope(viewer)) {
      return true;
    }
    if (this.target.world) {
      const worldScope = viewer.getWorldScopes().get(this.target.world.id);
      if (worldScope) {
        return worldScope.containsPosition(this.from) || worldScope.containsPosition(this.to);
      }
    }
    return false;
  }

  serialize(): MoveAction.Serialized {
    return {
      ...super.serialize(),
      to: this.to.serialize(),
      target: this.target.id
    };
  };

  static deserialize(json: MoveAction.Serialized): MoveAction {
    const game = Game.getInstance();
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      const { target } = common;
      const to: Vector = Vector.deserialize(json.to);
      // Build the action if fields are proper, otherwise throw an error
      if (target !== undefined && to) {
        const a = new MoveAction({ ...common, target, to });
        return a;
      } else {
        throw new Error('MoveAction fields not correct.');
      }
    } catch (error) {
      throw error;
    }
  }

}

// tslint:disable-next-line: no-namespace
export namespace MoveAction {
  export interface Params extends EntityParams {
    target: Entity;
  }

  export interface EntityParams extends ActionParameters {
    to: Vector;
  }

  export interface Serialized extends Action.Serialized {
    target: string,
    to: string
  }
}
