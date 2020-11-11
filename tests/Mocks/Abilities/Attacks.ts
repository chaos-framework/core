import Entity from '../../../src/EntityComponent/Entity';
import Ability, { OptionalCastParameters } from '../../../src/EntityComponent/Ability';
import Event from '../../../src/Events/Event';
import PropertyAdjustment from '../../../src/Events/Actions/PropertyAdjustment';

export class Slash extends Ability {
  name = "Slash"

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event {
    const amount = -3; // TODO roll based on INT or something
    const event = new Event([
      new PropertyAdjustment({ caster, target, using, property: "HP", amount, tags: ['attack', 'slash'] })
    ]);
    return event;
  }
}

export class Stab extends Ability {
  name = "Stab"

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event {
    const amount = -5; // TODO roll based on INT or something
    const event = new Event([
      new PropertyAdjustment({ caster, target, using, property: "HP", amount, tags: ['attack', 'pierce'] })
    ]);
    return event;
  }
}