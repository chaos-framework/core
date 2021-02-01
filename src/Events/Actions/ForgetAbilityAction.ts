import { Action, Ability, ActionParameters, IEntity, Component } from '../../internal'; 

export class ForgetAbilityAction extends Action {
  ability: Ability;
  target: IEntity;
  grantedBy?: IEntity | Component;

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
    grantedBy?: IEntity | Component;
  }
  
  export interface Params extends EntityParams {
    target: IEntity,
  }
}
