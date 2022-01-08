import { eachRight } from 'lodash';
import { Action, ActionParameters, Entity, ActionType, Vector, World, BroadcastType, Viewer, NestedSet, NestedSetChanges } from '../../internal.js';

export class ChangeWorldAction extends Action {
  actionType: ActionType = ActionType.CHANGE_WORLD_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  from: World;
  to: World;
  originPosition: Vector;
  position: Vector;
  movementAction = true;

  temporaryViewer?: NestedSet;

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

  initialize() {
    // Add temporary viewers to chunks in new location
    this.temporaryViewer = this.to.addTemporaryViewer(this.position.toChunkSpace(), this.target.active);
  }

  teardown() {
    // Unload temporary new chunks
    this.to.removeViewer(this.temporaryViewer!.id);
  }

  apply(): boolean {
    const result = this.target._changeWorlds(this.to, this.position);
    if (result instanceof NestedSetChanges) {
      this.chunkVisibilityChanges = result;
      return true;
    } else {
      return false;
    }
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    return true; // TODO SCOPE
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
