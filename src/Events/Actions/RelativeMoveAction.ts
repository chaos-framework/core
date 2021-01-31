import { Viewer } from '../../Game/Interfaces';
import { Action, ActionParameters, Entity, Game, Scope, Vector, World } from '../../internal';

export class RelativeMoveAction extends Action {
  target: Entity;
  from: Vector;
  amount: Vector;
  finalPosition?: Vector;
  visibilityChangingAction = true;

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

}

export namespace RelativeMoveAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    amount: Vector;
  }
}