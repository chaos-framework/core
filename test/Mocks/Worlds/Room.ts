import { World, Vector } from '../../../src/internal.js';

import BasicLayer, { BasicTiles } from '../Layers/BasicLayer';

export default class Room extends World {
  readonly stageLeft: Vector;
  readonly stageRight: Vector;

  constructor(public width: number = 9, public height: number = 9) {
    super({ width, height, fill: BasicTiles.Ground });
    if(width < 5 || height < 5) {
      throw new Error();
    }
    // Build north and south walls
    for(let x = 0; x < this.width; x++) {
      this.baseLayer.setTile(x, 0, BasicTiles.Wall);
      this.baseLayer.setTile(x, width - 1, BasicTiles.Wall);
    }
    for(let y = 0; y < this.width; y++) {
      this.baseLayer.setTile(0, y, BasicTiles.Wall);
      this.baseLayer.setTile(height - 1, y, BasicTiles.Wall);
    }
    // Determine stage left/right
    const midLines = new Vector(Math.floor(width / 2), Math.floor(height / 2));
    this.stageLeft = midLines.copyAdjusted(-1, 0);
    this.stageRight = midLines.copyAdjusted(1, 0);
  }

  serialize(): string {
    return "";
  }

  unserialize(data: string): Room {
    return new Room(5, 5);
  }
}
