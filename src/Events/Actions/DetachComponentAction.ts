import { Action, ActionParameters, Entity, Component, ActionType, BroadcastType } from '../../internal';

export class DetachComponentAction extends Action {
  actionType: ActionType = ActionType.ATTACH_COMPONENT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  component: Component;

  constructor({caster, target, component, using, metadata }: DetachComponentAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.component = component;
  }

  apply(): boolean {
    return this.target._detach(this.component);
  }

}

export namespace DetachComponentAction {
  export interface EntityParams extends ActionParameters {
    component: Component
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
