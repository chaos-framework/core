import { Entity, Ability, OptionalCastParameters, PropertyChangeAction, Event, } from '../../../src/internal';

import { SimpleEvent } from '../Events/SimpleEvent';

export class Slash extends Ability {
  name = "Slash"

  cast(caster: Entity, { using, target, params }: OptionalCastParameters = {}): Event | undefined {
    if(!target) {
      return undefined;
    }
    const amount = -3; // TODO roll based on INT or something
    const event = new SimpleEvent([
      new PropertyChangeAction({ caster, target, property: "HP", amount, tags: ['attack', 'slash'] })
    ]);
    return event;
  }
}

export class Stab extends Ability {
  name = "Stab"

  cast(caster: Entity, { using, target, params }: OptionalCastParameters = {}): Event | undefined {
    if(!target) {
      return undefined;
    }
    const amount = -5; // TODO roll based on INT or something
    const event = new SimpleEvent([
      new PropertyChangeAction({ caster, target, property: "HP", amount, tags: ['attack', 'pierce'] })
    ]);
    return event;
  }
}
