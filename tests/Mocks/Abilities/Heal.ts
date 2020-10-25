import Entity from '../../../src/EntityComponent/Entity';
import Ability from '../../../src/EntityComponent/Ability';
import Event from '../../../src/Events/Event';
import { PropertyAdjustment } from '../../../src/Events/Action';

export default class Heal extends Ability {
  name = "Heal";

  cast(caster: Entity, target?: any, options?: any): Event {
    // TODO check line-of-sight
    const amount = 5; // TODO roll based on INT
    target = target && target instanceof Entity ? target : caster; // default to casting on self
    const event = new Event([
      new PropertyAdjustment(caster, target, "HP", amount, ['heal'])
    ]);
    return event;
  }

}
