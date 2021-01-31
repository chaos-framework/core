import { Action, Ability, ActionParameters, Entity, Component } from '../../internal'; 

export class LearnAbilityAction extends Action {
  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: LearnAbilityAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  apply(): boolean {
    return this.target._grant(this.ability);
  }
}

export namespace LearnAbilityAction {
  export interface EntityParams extends ActionParameters {
    ability: Ability;
    grantedBy?: Entity | Component;
  }
  
  export interface Params extends EntityParams {
    target: Entity,
  }
}
