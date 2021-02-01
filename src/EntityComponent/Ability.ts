import { Event, IEntity, Component } from '../internal';

export default abstract class Ability {
  abstract name: string;
  granter?: any;

  abstract cast(caster: IEntity, { using, target, options }: OptionalCastParameters ): Event | undefined;

  // TODO serialize, unserialize
}

export interface OptionalCastParameters {
  using?: IEntity | Component, 
  target?: IEntity,
  options?: any
}

export class Grant {
  ability: Ability;
  grantedBy?: IEntity | Component;
  using?: IEntity | Component;

  constructor(ability: Ability, grantedBy?: IEntity | Component, using?: IEntity | Component) {
    this.ability = ability;
    if(grantedBy)
      this.grantedBy = grantedBy;
    if(using)
      this.using = using;
  }
}
