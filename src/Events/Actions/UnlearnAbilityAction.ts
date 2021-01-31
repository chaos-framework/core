import { Action, Ability, ActionParameters, Entity, Component } from '../../internal'; 

export class UnlearnAbilityAction extends Action {
  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: UnlearnAbilityAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  apply(): boolean {
    this.target._deny(this.ability, this.grantedBy, this.using);
    return false;
  }
}

export namespace UnlearnAbilityAction {
  export interface EntityParams extends ActionParameters {
    ability: Ability;
    grantedBy?: Entity | Component;
  }
  
  export interface Params extends EntityParams {
    target: Entity,
  }
}
