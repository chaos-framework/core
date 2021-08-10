import { Action, ActionParameters, Entity, Chaos, ActionType, Scope, Vector, World, 
  Viewer, BroadcastType } from '../../internal';

export class RelativeMoveAction extends Action {
  actionType: ActionType = ActionType.RELATIVE_MOVE_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  from: Vector;
  amount: Vector;
  finalPosition: Vector;
  movementAction = true;

  constructor({caster, target, amount, using, metadata }: RelativeMoveAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.from = target.position;
    this.amount = amount;
    this.finalPosition = this.target.position.add(this.amount);
    // Let the abstract impl of execute know to let listeners react in the space that this entity has not YET moved to
    if(this.target.world !== undefined) {
      this.additionalListenPoints = [{ world: this.target.world, position: this.finalPosition }];
    }
  }

  apply(): boolean {
    // Cache the final position for later reference as needed
    return this.target._move(this.finalPosition);
  }

  // See if this is moving into a circle from outside
  movesInto(origin: Vector, radius: number): boolean {
    return !this.from.withinRadius(origin, radius) && this.finalPosition.withinRadius(origin, radius);
  }

  // See if this is moving out of a circle from inside
  movesOutOf(origin: Vector, radius: number): boolean {
    return this.from.withinRadius(origin, radius) && !this.finalPosition.withinRadius(origin, radius);
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    // Check the default scope to see if the target's new position is in scope
    if(super.isInPlayerOrTeamScope(viewer)) {
      return true;
    } 
    if(this.target.world) {
      const worldScope = viewer.getWorldScopes().get(this.target.world.id);
      if(worldScope) {
        return worldScope.containsPosition(this.from) || (this.finalPosition !== undefined && worldScope.containsPosition(this.finalPosition));
      }
    }
    return false;
  }

  serialize(): RelativeMoveAction.Serialized {
    return {
      ...super.serialize(),
      amount: this.amount.serialize(),
      target: this.target.id
    };
  };

  static deserialize(json: RelativeMoveAction.Serialized): RelativeMoveAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      const { target } = common;
      const amount: Vector = Vector.deserialize(json.amount);
      // Build the action if fields are proper, otherwise throw an error
      if(target !== undefined && amount) {
        const a = new RelativeMoveAction({...common, target, amount});
        return a;
      } else {
        throw new Error('MoveAction fields not correct.');
      }
    } catch(error) {
      throw error;
    }
  }


}

export namespace RelativeMoveAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    amount: Vector;
  }

  export interface Serialized extends Action.Serialized {
    target: string,
    amount: string
  }
}