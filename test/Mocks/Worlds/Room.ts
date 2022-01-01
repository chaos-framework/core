import { World, Vector, ByteLayer, ArrayChunk } from '../../../src/internal.js';

import { BasicTiles } from '../Layers/BasicLayer.js';

export default class Room extends World {
  readonly stageLeft: Vector;
  readonly stageRight: Vector;

  constructor(public width: number = 9, public height: number = 9) {
    super({ size: new Vector(width, height), baseLayer: new ByteLayer(BasicTiles.Air) });
    if(width < 5 || height < 5) {
      throw new Error();
    }
    // Build north and south walls
    for(let x = 0; x < this.width; x++) {
      this.baseLayer.set(x, 0, BasicTiles.Wall);
      this.baseLayer.set(x, width - 1, BasicTiles.Wall);
    }
    for(let y = 0; y < this.width; y++) {
      this.baseLayer.set(0, y, BasicTiles.Wall);
      this.baseLayer.set(height - 1, y, BasicTiles.Wall);
    }
    // Determine stage left/right
    const midLines = new Vector(Math.floor(width / 2), Math.floor(height / 2));
    this.stageLeft = midLines.copyAdjusted(-1, 0);
    this.stageRight = midLines.copyAdjusted(1, 0);
  }

  initializeChunk(x: number, y: number) {
    this.baseLayer.setChunk(x, y, new ArrayChunk<number>(BasicTiles.Air));
  }

  serialize(): string {
    return "";
  }

  unserialize(data: string): Room {
    return new Room(5, 5);
  }
}
