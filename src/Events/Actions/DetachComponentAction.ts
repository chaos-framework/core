import {
  Action,
  ActionParameters,
  Entity,
  Component,
  ActionType,
  BroadcastType,
  ComponentContainer,
  Chaos,
  ActionEffectGenerator
} from '../../internal.js'

export class DetachComponentAction extends Action {
  actionType: ActionType = ActionType.DETACH_COMPONENT_ACTION
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY

  target: Entity
  component: Component

  constructor({
    caster,
    target,
    component,
    using,
    metadata
  }: DetachComponentAction.Params) {
    super({ caster, using, metadata })
    this.target = target
    this.component = component
  }

  *apply(): ActionEffectGenerator {
    this.component.parent?.components.removeComponent(this.component)
    return true
  }

  serialize(): DetachComponentAction.Serialized {
    return {
      ...super.serialize(),
      target: this.target.id,
      component: this.component.id
    }
  }

  static deserialize(json: any): DetachComponentAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json)
      const { target } = common
      // Deserialize unique fields
      const component = Chaos.allComponents.get(json.component)
      if (component === undefined) {
        throw new Error(`Couldn't find component.`) // TODO define a commmon error for type + field that is bad
      } else if (target === undefined) {
        throw new Error(`Couldn't find target.`) // TODO define a commmon error for type + field that is bad
      }
      // Build the action if we did indeed find
      return new DetachComponentAction({ ...common, target, component })
    } catch (error) {
      throw error
    }
  }
}

export namespace DetachComponentAction {
  export interface EntityParams extends ActionParameters {
    component: Component
  }

  export interface ComponentParams extends ActionParameters {
    target: Entity
  }

  export interface Params extends EntityParams, ComponentParams {}

  export interface Serialized extends Action.Serialized {
    target: string
    component: string
  }
}
