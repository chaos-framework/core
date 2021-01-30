import { Viewer } from '../../Game/Interfaces';
import { Action, ActionParameters, Entity, Game, Scope, Vector, World } from '../../internal'; 

export class MoveAction extends Action {
  target: Entity;
  from: Vector;
  to: Vector;
  visibilityChangingAction = true;

  static requiredFields: string[] = ['permitted', 'target', 'to'];

  constructor({caster, target, to, using, tags = []}: MoveAction.Params) {
    super({caster, using, tags});
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
    if(world && this.from.differentChunkFrom(this.to)) {
      world.addView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
    }
  }

  teardown() {
    const { world } = this.target;
    if(world && this.from.differentChunkFrom(this.to)) {
      // Check if this entity is active, and therefore needs to persist the world around it
      // Also check if action was permitted. If so, remove old view. If neither is true, just remove old.
      if(this.target.active && this.permitted) {
        world.removeView(this.target, this.from.toChunkSpace(), this.to.toChunkSpace());
      } else {
        world.removeView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
      }
    }
  }

  static unserialize(json: any, game: Game): MoveAction {
    if(!Action.serializedHasRequiredFields(json)) {
      throw new Error();
    }
    const target: Entity | undefined = game.getEntity(json['target']);
    if(target === undefined){
      throw new Error();
    }

    const caster: Entity | undefined = game.getEntity(json['caster']);
    const using: Entity | undefined = game.getEntity(json['using']);
    const to: Vector = Vector.unserialize(json['to']);
    // TODO tags

    return new MoveAction({caster, target, using, to});
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    if(super.isInPlayerOrTeamScope(viewer)) {
      return true;
    } 
    if(this.target.world) {
      const worldScope = viewer.getWorldScopes().get(this.target.world.id);
      if(worldScope) {
        return worldScope.containsPosition(this.from) || worldScope.containsPosition(this.to);
      }
    }
    return false;
  }

}

export namespace MoveAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    to: Vector;
  }
}

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

export class ChangeWorldAction extends Action {
  target: Entity;
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
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    from: World,
    to: World,
    position: Vector;
  }
}
