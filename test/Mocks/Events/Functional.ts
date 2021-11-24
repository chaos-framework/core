import { Action, Event, Entity, PropertyChangeAction, CustomAction } from '../../../src/internal.js';

export default class RequiresInitialSuccess implements Event {
  step = 0;

  constructor(public caster: Entity, public target: Entity) {

  }

  getNextAction(previousAction: Action): Action | undefined {
    const { caster, target } = this;
    switch(this.step) {
      // Indicate that we want to cast fireball
      case 0:
        return new CustomAction('REQUIRE_INITIAL_SUCCESS', { });
      // If previous action was not denied, do damage to the target
      case 1:
        if(previousAction.permitted) {
          return new PropertyChangeAction({ caster, target, property: 'HP', amount: -5, tags: ['FIRE'] })
            .if(() => { return !this.caster.tagged('DEAD') });
        }
    }
    return undefined;
  }
}