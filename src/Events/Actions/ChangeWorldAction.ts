import { Action, ActionParameters, IEntity, Vector, World } from '../../internal';
import { Viewer } from '../../Game/Interfaces';

export class ChangeWorldAction extends Action {
  target: IEntity;
  from: World;
  to: World;
  originPosition: Vector;
  position: Vector;
  visibilityChangingAction = true;

  constructor({caster, target, from, to, position, using, tags = []}: ChangeWorldAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.from = from;
    this.to = to;
    this.position = position;
    this.originPosition = target.position;
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
    target: IEntity;
  }
  
  export interface EntityParams extends ActionParameters {
    from: World,
    to: World,
    position: Vector;
  }
}
