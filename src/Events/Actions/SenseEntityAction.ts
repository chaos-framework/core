import { Action, Component, ActionParameters, Entity, ActionType, CachesSensedEntities, BroadcastType } from '../../internal.js';

export class SenseEntityAction extends Action {
  actionType: ActionType = ActionType.SENSE_ENTITY_ACTION;
  broadcastType = BroadcastType.NONE;

  broadcast = false;

  caster: Entity;             // entity sensing the other (senses cannot come from another entity)
  target: Entity;             // entity being sensed
  using: Component & CachesSensedEntities;  // component doing the sensing

  constructor({caster, target, using, metadata }: SenseEntityAction.Params) {
    super({caster, using, metadata });
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  apply(): boolean {
    const changes = this.caster._senseEntity(this.target, this.using);
    if(changes.hasChanges) {
      this.entityVisibilityChanges = { type: 'addition', changes };
    }
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace SenseEntityAction {
  export interface EntityParams extends ActionParameters { 
    target: Entity;
    using: Component & CachesSensedEntities;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }

}
