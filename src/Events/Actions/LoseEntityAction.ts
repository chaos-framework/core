import { Action, Component, CachesSensedEntities, ActionParameters, Entity, ActionType, BroadcastType, NestedChanges } from '../../internal.js';

export class LoseEntityAction extends Action {
  actionType: ActionType = ActionType.LOSE_ENTITY_ACTION;
  broadcastType = BroadcastType.NONE;

  broadcast = false;

  caster: Entity;
  target: Entity;
  using: Component & CachesSensedEntities;

  entityVisibilityChanges = new NestedChanges;

  constructor({caster, target, using, metadata }: LoseEntityAction.Params) {
    super({caster, using, metadata });
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  apply(): boolean {
    return this.target._loseEntity(this.target, this.using, this.entityVisibilityChanges);
  }
}

// tslint:disable-next-line: no-namespace
export namespace LoseEntityAction {
  export interface EntityParams extends ActionParameters { 
    target: Entity;
    using: Component & CachesSensedEntities;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }

}
