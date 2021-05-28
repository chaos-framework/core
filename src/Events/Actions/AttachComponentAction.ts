import { Action, ActionParameters, Entity, Component, MessageType } from '../../internal';

export class AttachComponentAction extends Action {
  messageType: MessageType = MessageType.ATTACH_COMPONENT_ACTION;

  target: Entity;
  component: Component;

  constructor({caster, target, component, using, tags = []}: AttachComponentAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.component = component;
  }

  apply(): boolean {
    return this.target._attach(this.component);
  }

}

export namespace AttachComponentAction {
  export interface EntityParams extends ActionParameters {
    component: Component
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
