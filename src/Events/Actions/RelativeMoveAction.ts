import { Viewer } from '../../Game/Interfaces';
import { Action, ActionParameters, Entity, Game, MessageType, Scope, Vector, World } from '../../internal';

export class RelativeMoveAction extends Action {
  messageType: MessageType = MessageType.RELATIVE_MOVE_ACTION;

  target: Entity;
  from: Vector;
  amount: Vector;
  finalPosition?: Vector;
  movementAction = true;

  constructor({caster, target, amount, using, tags = []}: RelativeMoveAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.from = target.position;
    this.amount = amount;
  }

  apply(): boolean {
    // Cache the final position for later reference as needed
    this.finalPosition = this.target.position.add(this.amount);
    return this.target._move(this.finalPosition);
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
    const game = Game.getInstance();
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