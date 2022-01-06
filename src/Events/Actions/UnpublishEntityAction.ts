import { Action, ActionParameters, Entity, Chaos, ActionType, BroadcastType } from '../../internal.js';

export class UnpublishEntityAction extends Action {
  actionType: ActionType = ActionType.UNPUBLISH_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  entity: Entity;
  target?: Entity; // likely unused; if the unpublishing is hostile, could be cancelled by target in a meaningful way
  movementAction = true;

  constructor({ caster, target, entity, using, metadata }: UnpublishEntityAction.Params) {
    super({caster, using, metadata });
    this.entity = entity;
    this.target = target;
    // Let the abstract impl of execute know to let listeners react around the entity itself
    if(entity.world !== undefined) {
      this.additionalListenPoints = [{ world: entity.world, position: entity.position }];
    }
    this.additionalListeners = [entity];
  }

  apply(): boolean {
    this.chunkVisibilityChanges = { removals: this.entity._unpublish() || undefined };
    return true;
  }
    
  getEntity(): Entity {
    return this.entity;
  }

  serialize(): UnpublishEntityAction.Serialized {
    return {
      ...super.serialize(),
      entity: this.entity.id
    };
  };

  static deserialize(json: UnpublishEntityAction.Serialized): UnpublishEntityAction {
    // Deserialize common fields
    const common = Action.deserializeCommonFields(json);
    // Deserialize unique fields
    const entity = Chaos.entities.get(json.entity);
    // Build the action if fields are proper, otherwise throw an error
    if (entity === undefined) {
      throw new Error('UnpublishEntityAction fields not correct.');
    }
    return new UnpublishEntityAction({ ...common, entity });
  }
}

export namespace UnpublishEntityAction {
  export interface EntityParams extends ActionParameters {
    target?: Entity
  }

  export interface Params extends EntityParams {
    entity: Entity
  }

  export interface Serialized extends Action.Serialized {
    entity: string;
  }
}
