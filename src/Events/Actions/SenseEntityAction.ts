import { Component } from '../..';
import { Action, ActionParameters, Entity, MessageType, Sensor } from '../../internal';
import { NestedChanges } from '../../Util/NestedMap';

export class SenseEntityAction extends Action {
  messageType: MessageType = MessageType.SENSE_ENTITY_ACTION;

  caster: Entity;
  target: Entity;
  using: Component & Sensor;

  constructor({caster, target, using, tags = []}: SenseEntityAction.Params) {
    super({caster, using, tags});
    this.caster = caster;
    this.using = using;
    this.target = target;
  }

  apply(): boolean {
    const changes = this.caster._senseEntity(this.target, this.using);
    if(changes.hasChanges) {
      this.visibilityChanges = { type: 'addition', changes };
    }
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace SenseEntityAction {
  export interface EntityParams extends ActionParameters { 
    target: Entity;
    using: Component & Sensor;
  }

  export interface Params extends EntityParams {
    caster: Entity;
  }

}
