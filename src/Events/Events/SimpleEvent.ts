import { Action, Event, IEntity} from '../../internal';

export default class SimpleEvent implements Event {
  index = 0;

  constructor(private actions: Action[], caster?: IEntity) { };

  getNextAction(previousAction?: Action): Action | undefined {
    if (this.actions.length > this.index) {
      return this.actions[this.index++];
    } else {
      return undefined;
    }
  }
}
