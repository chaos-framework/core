import { Entity, Ability, OptionalCastParameters, Event } from '../../../src/internal';

import { SimpleEvent } from '../Events/SimpleEvent';

export class Heal extends Ability {
  name = "Heal";

  cast(caster: Entity, { using, target, params }: OptionalCastParameters = {}): Event | undefined {
    if(!target) {
      return undefined;
    }
    const hpValue = target.properties.get("HP");
    if(!hpValue) {
      return undefined;
    }
    // TODO check line-of-sight
    const amount = 5; // TODO roll based on INT or something
    // default to casting on self
    target = target && target instanceof Entity ? target : caster;
    const event = new SimpleEvent([
      hpValue.current.adjust({amount, caster, metadata: { heals: true } })
    ]);
    return event;
  }
  
  _move() {

  }

}
