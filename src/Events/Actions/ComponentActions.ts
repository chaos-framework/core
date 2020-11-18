import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";
import Component from '../../EntityComponent/Component';

export class AttachComponentAction extends Action {
  target: Entity;
  component: Component;

  constructor(
    {caster, target, component, using, tags = []}: AttachComponentActionParameters
  ) {
    super({caster, using, tags});
    this.target = target;
    this.component = component;
  }

  apply(): boolean {
    return this.target._attach(this.component);
  }

}

export interface AttachComponentActionParameters extends ActionParameters {
  target: Entity;
  component: Component
}

export interface AttachComponentActionEntityParameters extends ActionParameters {
  component: Component
}
