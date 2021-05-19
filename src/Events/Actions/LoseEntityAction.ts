import { Component } from '../..';
import { Action, ActionParameters, Entity, Sensor } from '../../internal';

export class LoseEntityAction extends Action {
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
    this.caster._loseEntity(this.target, this.using);
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
