import { IEntity, Ability, OptionalCastParameters, Event, SimpleEvent } from '../../../src/internal';

export class Heal extends Ability {
  name = "Heal";

  cast(caster: IEntity, { using, target, options }: OptionalCastParameters = {}): Event | undefined {
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
    target = target && target instanceof IEntity ? target : caster;
    const event = new SimpleEvent([
      hpValue.current.adjust({amount, caster, tags: ['heal'] })
    ]);
    return event;
  }
  
  _move() {

  }

}
