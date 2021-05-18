import { Component } from '../..';
import { Action, ActionParameters, Entity } from '../../internal';

export class SenseEntityAction extends Action {
  caster: Entity;
  target: Entity;
  using: Component;

  constructor({caster, target, using, tags = []}: SenseEntityAction.Params) {
    super({caster, using, tags});
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  apply(): boolean {
    this.caster._senseEntity(this.target, this.using);
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace SenseEntityAction {
  export interface EntityParams extends ActionParameters { 
    target: Entity;
    using: Component;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }

}
