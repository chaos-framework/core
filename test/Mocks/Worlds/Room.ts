import World from '../../../src/World/World';
import BasicLayer from '../Layers/BasicLayer';

class Room extends World {
  width = BigInt(10);
  height = BigInt(10);

  constructor() {
    super(new BasicLayer(), {width: BigInt(10), height: BigInt(10)});
    
  }

  serialize(): string {
    return "";
  }
  unserialize(data: string): Room {
    return new Room();
  }
}