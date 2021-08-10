import { Action, ActionParameters, Entity, ActionType, Vector, World, BroadcastType } from '../../internal';
import { Viewer } from '../../Game/Interfaces';

export class ChangeWorldAction extends Action {
  actionType: ActionType = ActionType.CHANGE_WORLD_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  from: World;
  to: World;
  originPosition: Vector;
  position: Vector;
  movementAction = true;

  constructor({caster, target, from, to, position, using, metadata }: ChangeWorldAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.from = from;
    this.to = to;
    this.position = position;
    this.originPosition = target.position;
    // Let the abstract impl of execute know to let listeners react in the space that this entity has not YET moved to
    if(this.target.world !== undefined) {
      this.additionalListenPoints = [{ world: to, position }];
    }
  }

  apply(): boolean {
    return this.target._changeWorlds(this.to, this.position);
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    if(super.isInPlayerOrTeamScope(viewer)) {
      return true;
    } else {
      const fromScope = viewer.getWorldScopes().get(this.from.id);
      const toScope = viewer.getWorldScopes().get(this.to.id);
      if(fromScope && fromScope.containsPosition(this.originPosition)) {
        return true;
      }
      if(toScope && toScope.containsPosition(this.position)) {
        return true;
      }
    }
    return false;
  }
}

export namespace ChangeWorldAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    from: World,
    to: World,
    position: Vector;
  }
}
