import { Action, Event, Entity, PropertyChangeAction } from '../../../src/internal';

export default class FireballEvent implements Event {
  step = 0;

  constructor(public caster: Entity, public target: Entity) {

  }

  getNextAction(): Action | undefined {
    switch(this.step) {
      case 0:
        const { caster, target } = this;
        return new PropertyChangeAction({ caster, target, property: 'HP', amount: -5, tags: ['FIRE'] })
          .if(() => { return !this.caster.tagged('DEAD') });
    }
    return undefined;
  }
}