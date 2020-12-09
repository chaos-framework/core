import World from '../../../src/World/World';
import BasicLayer from '../Layers/BasicLayer';

export default class Room extends World {
  width = BigInt(10);
  height = BigInt(10);

  constructor() {
    super(new BasicLayer(0), {width: BigInt(10), height: BigInt(10)});

  }

  initializeChunk(x: number, y: number): void {

  }

  serialize(): string {
    return "";
  }
  unserialize(data: string): Room {
    return new Room();
  }
}