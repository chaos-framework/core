import { Component } from '../..';
import { Action, ActionParameters, Entity } from '../../internal';

export class LoseEntityAction extends Action {
  caster: Entity;
  target: Entity;
  using: Component;

  constructor({caster, target, using, tags = []}: LoseEntityAction.Params) {
    super({caster, using, tags});
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  apply(): boolean {
    return this.caster._loseEntity(this.target, this.using);
  }
}

// tslint:disable-next-line: no-namespace
export namespace LoseEntityAction {
  export interface EntityParams extends ActionParameters { 
    target: Entity;
    using: Component;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }

}
