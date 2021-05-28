import { Action, Ability, ActionParameters, Entity, Component, MessageType } from '../../internal'; 

export class ForgetAbilityAction extends Action {
  messageType: MessageType = MessageType.FORGET_ABILITY_ACTION;

  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: ForgetAbilityAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  apply(): boolean {
    this.target._forget(this.ability, this.grantedBy, this.using);
    return false;
  }
}

export namespace ForgetAbilityAction {
  export interface EntityParams extends ActionParameters {
    ability: Ability;
    grantedBy?: Entity | Component;
  }
  
  export interface Params extends EntityParams {
    target: Entity,
  }
}
