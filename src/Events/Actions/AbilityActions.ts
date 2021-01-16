import { Action, Ability, ActionParameters, Entity, Component } from '../../internal'; 

export class GrantAbility extends Action {
  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: AbilityActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  apply(): boolean {
    return this.target._grant(this.ability);
  }
}

export class DenyAbility extends Action {
  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: AbilityActionParameters) {
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

export interface AbilityActionParameters extends ActionParameters {
  target: Entity,
  ability: Ability;
  grantedBy?: Entity | Component;
}

export interface AbilityActionEntityParameters extends ActionParameters {
  ability: Ability;
  grantedBy?: Entity | Component;
}