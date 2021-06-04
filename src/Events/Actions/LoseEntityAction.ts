import { Action, Component, ActionParameters, Entity, ActionType, Sensor, BroadcastType } from '../../internal';

export class LoseEntityAction extends Action {
  actionType: ActionType = ActionType.LOSE_ENTITY_ACTION;
  broadcastType = BroadcastType.NONE;

  broadcast = false;

  caster: Entity;
  target: Entity;
  using: Component & Sensor;

  constructor({caster, target, using, tags = []}: LoseEntityAction.Params) {
    super({caster, using, tags});
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  apply(): boolean {
    const changes = this.caster._loseEntity(this.target, this.using);
    if(changes.hasChanges) {
      this.visibilityChanges = { type: 'removal', changes };
    }
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace LoseEntityAction {
  export interface EntityParams extends ActionParameters { 
    target: Entity;
    using: Component & Sensor;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }

}
