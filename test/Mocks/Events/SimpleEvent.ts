import { Action, Event, Entity} from '../../../src/internal';

export class SimpleEvent implements Event {
  index = 0;

  constructor(private actions: Action[], caster?: Entity) { };

  getNextAction(previousAction?: Action): Action | undefined {
    if (this.actions.length > this.index) {
      return this.actions[this.index++];
    } else {
      return undefined;
    }
  }
}
