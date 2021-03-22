import { Event, Entity, Component } from '../internal';

export default abstract class Ability {
  abstract name: string;
  granter?: any;

  abstract cast(caster: Entity, { using, target, options }: OptionalCastParameters ): Event | undefined;

  // TODO serialize, unserialize
}

export interface OptionalCastParameters {
  using?: Entity | Component, 
  target?: Entity,
  options?: any
}

export class Grant {
  ability: Ability;
  grantedBy?: Entity | Component;
  using?: Entity | Component;

  constructor(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component) {
    this.ability = ability;
    if(grantedBy)
      this.grantedBy = grantedBy;
    if(using)
      this.using = using;
  }
}
