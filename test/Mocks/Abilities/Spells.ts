import Entity from '../../../src/EntityComponent/Entity';
import Ability, { OptionalCastParameters } from '../../../src/EntityComponent/Ability';
import Event from '../../../src/Events/Event';

export class Heal extends Ability {
  name = "Heal";

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event | undefined {
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
    const event = new Event([
      hpValue.current.adjust({amount, caster, tags: ['heal'] })
    ]);
    return event;
  }
  
  _move() {

  }

}
