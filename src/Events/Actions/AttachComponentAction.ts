import { Action, ActionParameters, Entity, Component, ActionType, BroadcastType, Chaos } from '../../internal.js';

export class AttachComponentAction extends Action {
  actionType: ActionType = ActionType.ATTACH_COMPONENT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  component: Component;

  constructor({caster, target, component, using, metadata }: AttachComponentAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.component = component;
  }

  apply(): boolean {
    return this.target._attach(this.component);
  }

  serialize(): AttachComponentAction.Serialized {
    return {
      ...super.serialize(),
      target: this.target.id,
      component: this.component.serializeForClient()
    };
  }
  
  static deserialize(json: any): AttachComponentAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      const { target } = common;
      // Deserialize unique fields
      const component = Component.DeserializeAsClient(json.component);
      if (target === undefined) {
        throw new Error;
      }
      // Build the action if we did indeed find
      return new AttachComponentAction({ ...common, target, component });
    } catch (error) {
      throw error;
    }
  }
}

export namespace AttachComponentAction {
  export interface EntityParams extends ActionParameters {
    component: Component
  }

  export interface ComponentParams extends ActionParameters {
    target: Entity;
  }

  export interface Params extends EntityParams, ComponentParams { }

  export interface Serialized extends Action.Serialized {
    target: string,
    component: Component.SerializedForClient;
  }
}
