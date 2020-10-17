import Event from '../Events/Event';
import Entity from './Entity';

export default abstract class Ability {
  abstract name: string = "New Ability";

  constructor() {
  }

  abstract cast(caster: Entity): Event;

  // TODO serialize, unserialize
}