import Ability, { OptionalCastParameters } from '../../../src/EntityComponent/Ability';
import Event from '../../../src/Events/Event'
import Entity from '../../../src/EntityComponent/Entity';

export default class EmptyAbility extends Ability {
  name = "Fake Ability";

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event {
    return new Event([]);
  }
}