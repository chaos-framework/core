import { Event, Entity, Component } from '../internal';

export default abstract class Ability {
  abstract name: string;
  granter?: Entity | Component;
  using?: Entity | Component;

  abstract cast(caster: Entity, { using, target, params }: OptionalCastParameters ): Event | string | undefined;

  // TODO serialize, unserialize
}

export interface OptionalCastParameters {
  target?: Entity,
  grantedBy?: string,
  using?: string,
  params?: any
}

export interface Grant {
  ability: Ability,
  grantedBy?: string,
  using?: string
}
