import { Viewer } from '../../Game/Interfaces';
import { Action, ActionParameters, Entity, Game, Vector } from '../../internal'; 

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