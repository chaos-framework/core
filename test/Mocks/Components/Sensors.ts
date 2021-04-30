import { Action, Component, Entity, Reacter, Sensor } from '../../../src/internal';

export class Eyes extends Component implements Sensor, Reacter {
  sense(action: Action) {
    return true;
  }

  react(action: Action) {
    if (this.parent?.sensedEntities && action.sensors.get(this.parent?.id)) {
      this.parent.
    }
  }
}
