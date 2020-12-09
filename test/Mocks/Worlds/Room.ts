import World from '../../../src/World/World';
import BasicLayer, { BasicTiles } from '../Layers/BasicLayer';

export default class Room extends World {
  width = 10;
  height = 10;

  constructor() {
    super(new BasicLayer(BasicTiles.Ground), {width: 10, height: 10});
    // Build north and south walls
    for(let x = 0; x < this.width; x++) {
      this.baseLayer.setTile(x, 0, BasicTiles.Wall);
      this.baseLayer.setTile(x, 9, BasicTiles.Wall);
    }
    for(let y = 0; y < this.width; y++) {
      this.baseLayer.setTile(0, y, BasicTiles.Wall);
      this.baseLayer.setTile(9, y, BasicTiles.Wall);
    }
  }

  serialize(): string {
    return "";
  }
  unserialize(data: string): Room {
    return new Room();
  }
}