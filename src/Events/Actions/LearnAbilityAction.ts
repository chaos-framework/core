import {
  Action,
  Ability,
  ActionParameters,
  Entity,
  Component,
  ActionType,
  BroadcastType,
  ActionEffectGenerator
} from '../../internal.js';

export class LearnAbilityAction extends Action {
  actionType: ActionType = ActionType.LEARN_ABILITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY; // TODO only broadcast to owners?

  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({
    caster,
    target,
    using,
    grantedBy,
    ability,
    metadata
  }: LearnAbilityAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  *apply(): ActionEffectGenerator {
    return this.target._learn(this.ability);
  }
}

export namespace LearnAbilityAction {
  export interface EntityParams extends ActionParameters {
    ability: Ability;
    grantedBy?: Entity | Component;
  }

  export interface Params extends EntityParams {
    target: Entity;
  }
}
