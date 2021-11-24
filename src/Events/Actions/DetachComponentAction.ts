import { Action, ActionParameters, Entity, Component, ActionType, BroadcastType, ComponentContainer } from '../../internal.js';

export class DetachComponentAction extends Action {
  actionType: ActionType = ActionType.DETACH_COMPONENT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  component: Component;

  constructor({caster, target, component, using, metadata }: DetachComponentAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.component = component;
  }

  apply(): boolean {
    this.component.parent?.components.removeComponent(this.component);
    return true;
  }

}

export namespace DetachComponentAction {
  export interface EntityParams extends ActionParameters {
    component: Component
  }

  export interface ComponentParams extends ActionParameters {
    target: Entity
  }

  export interface Params extends EntityParams, ComponentParams { }
}
