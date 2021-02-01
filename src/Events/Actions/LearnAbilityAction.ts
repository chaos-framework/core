import { Action, Ability, ActionParameters, IEntity, Component } from '../../internal'; 

export class LearnAbilityAction extends Action {
  ability: Ability;
  target: IEntity;
  grantedBy?: IEntity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: LearnAbilityAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  apply(): boolean {
    return this.target._learn(this.ability);
  }
}

export namespace LearnAbilityAction {
  export interface EntityParams extends ActionParameters {
    ability: Ability;
    grantedBy?: IEntity | Component;
  }
  
  export interface Params extends EntityParams {
    target: IEntity,
  }
}
