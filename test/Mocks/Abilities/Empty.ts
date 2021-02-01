import { Ability, OptionalCastParameters, Event, IEntity, SimpleEvent } from '../../../src/internal';

export default class EmptyAbility extends Ability {
  name = "Fake Ability";

  cast(caster: IEntity, { using, target, options }: OptionalCastParameters = {}): Event {
    return new SimpleEvent([]);
  }
}