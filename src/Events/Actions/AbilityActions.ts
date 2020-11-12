import Ability from '../../EntityComponent/Ability';
import Entity from '../../EntityComponent/Entity';
import Action, { ActionParameters } from '../Action'

export class GrantAbility extends Action {
  ability: Ability;
  target: Entity;

  constructor({caster, target, using, ability, tags = []}: AbilityActionParameters) {
    super(caster, using, tags);
    this.target = target ? target : caster;
    this.ability = ability;
  }

  apply(): boolean {
    return this.target._grant(this.ability);
  }
}

export class DenyAbility extends Action {
  ability: Ability;
  target: Entity;

  constructor({caster, target, using, ability, tags = []}: AbilityActionParameters) {
    super(caster, using, tags);
    this.target = target ? target : caster;
    this.ability = ability;
  }

  apply(): boolean {
    // TODO revoke ability
    return false;
  }
}


export interface AbilityActionParameters extends ActionParameters {
  ability: Ability;
}