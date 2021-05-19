import { Action, Component, Entity, NestedMap, Reacter, Sensor } from '../../../src/internal';

export class Eyes extends Component implements Sensor, Reacter {
  sensedEntities: NestedMap<Entity>;

  constructor() {
    super(); // SHOULD hypothetically take ID in case of serialization / deserialization
    this.sensedEntities = new NestedMap<Entity>(this.id, 'sensor');
  }

  sense(action: Action) {
    return true;
  }

  react(action: Action) {
 
  }
}
