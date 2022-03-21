import { eachRight } from 'lodash';
import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  Vector,
  World,
  BroadcastType,
  Viewer,
  NestedSet,
  NestedSetChanges,
  ProcessEffectGenerator
} from '../../internal.js';

export class ChangeWorldAction extends Action<Entity> {
  actionType: ActionType = ActionType.CHANGE_WORLD_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  from: World;
  to: World;
  originPosition: Vector;
  position: Vector;
  movementAction = true;

  temporaryViewer?: NestedSet;
  chunkVisibilityChanges = new NestedSetChanges();

  constructor({ caster, target, from, to, position, using, metadata }: ChangeWorldAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.from = from;
    this.to = to;
    this.position = position;
    this.originPosition = target.position;
    // Let the abstract impl of execute know to let listeners react in the space that this entity has not YET moved to
    if (this.target.world !== undefined) {
      this.additionalListenPoints = [{ world: to, position }];
    }
  }

  initialize() {
    // Add temporary viewers to chunks in new location
    this.temporaryViewer = this.to.addTemporaryViewer(
      this.position.toChunkSpace(),
      this.target.active,
      this.chunkVisibilityChanges
    );
  }

  teardown() {
    // Unload temporary new chunks
    this.to.removeViewer(this.temporaryViewer!.id, this.chunkVisibilityChanges);
  }

  async *apply(): ProcessEffectGenerator {
    return this.target._changeWorlds(this.to, this.position, this.chunkVisibilityChanges);
  }

  isInPlayerOrTeamScope(viewer: Viewer): boolean {
    return true; // TODO SCOPE
  }
}

export namespace ChangeWorldAction {
  export interface Params extends EntityParams {
    target: Entity;
    from: World;
  }

  export interface EntityParams extends ActionParameters<Entity> {
    to: World;
    position: Vector;
  }
}
