import { Ability, OptionalCastParameters, Event, Entity, SimpleEvent } from '../../../src/internal';

export default class EmptyAbility extends Ability {
  name = "Fake Ability";

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event {
    return new SimpleEvent([]);
  }
}