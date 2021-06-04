import { Action, ActionParameters, Entity, Game, ActionType, BroadcastType } from '../../internal';

export class UnpublishEntityAction extends Action {
  actionType: ActionType = ActionType.UNPUBLISH_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  entity: Entity;
  target?: Entity; // likely unused; if the unpublishing is hostile, could be cancelled by target in a meaningful way
  movementAction = true;

  constructor({ caster, target, entity, using, tags }: UnpublishEntityAction.Params) {
    super({caster, using, tags});
    this.entity = entity;
    this.target = target;
    // Let the abstract impl of execute know to let listeners react around the entity itself
    if(entity.world !== undefined) {
      this.additionalListenPoints = [{ world: entity.world, position: entity.position }];
    }
    this.additionalListeners = [entity];
  }

  apply(): boolean {
    return this.entity._unpublish();
  }

  serialize(): UnpublishEntityAction.Serialized {
    return {
      ...super.serialize(),
      entity: this.entity.id
    };
  };
  
  getEntity(): Entity {
    return this.entity;
  }

  static deserialize(json: UnpublishEntityAction.Serialized): UnpublishEntityAction {
    const game = Game.getInstance();
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      const entityId = json.entity;
      // Build the action if fields are proper, otherwise throw an error
      if (entityId && game.entities.has(entityId)) {
        const a = new UnpublishEntityAction({ ...common, entity: game.entities.get(entityId)! });
        return a;
      } else {
        throw new Error('UnpublishEntityAction fields not correct.');
      }
    } catch (error) {
      throw error;
    }
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
