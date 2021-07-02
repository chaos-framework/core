import { Ability, OptionalCastParameters, Event, Entity } from '../../../src/internal';

import { SimpleEvent } from '../Events/SimpleEvent';

export default class EmptyAbility extends Ability {
  name = "Fake Ability";

  cast(caster: Entity, { using, target, params }: OptionalCastParameters = {}): Event {
    return new SimpleEvent([]);
  }
}