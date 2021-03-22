import { Entity, Ability, OptionalCastParameters, PropertyChangeAction,
  SimpleEvent, Event, } from '../../../src/internal';

export class Slash extends Ability {
  name = "Slash"

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event | undefined {
    if(!target) {
      return undefined;
    }
    const amount = -3; // TODO roll based on INT or something
    const event = new SimpleEvent([
      new PropertyChangeAction({ caster, target, using, property: "HP", amount, tags: ['attack', 'slash'] })
    ]);
    return event;
  }
}

export class Stab extends Ability {
  name = "Stab"

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event | undefined {
    if(!target) {
      return undefined;
    }
    const amount = -5; // TODO roll based on INT or something
    const event = new SimpleEvent([
      new PropertyChangeAction({ caster, target, using, property: "HP", amount, tags: ['attack', 'pierce'] })
    ]);
    return event;
  }
}
