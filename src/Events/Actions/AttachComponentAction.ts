import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";
import Component from '../../EntityComponent/Component';

export default class AttachComponentAction extends Action {
  target: Entity;
  component: Component;

  constructor(
    {caster, target, component, using, tags = []}: AttachComponentActionParameters
  ) {
    super(caster, using, tags);
    this.target = target ? target : caster;
    this.component = component;
  }

  apply(): boolean {
    return this.target._attach(this.component);
  }

}

export interface AttachComponentActionParameters extends ActionParameters {
  component: Component
}
