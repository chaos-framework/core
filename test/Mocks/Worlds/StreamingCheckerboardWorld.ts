import Vector from '../../../src/Math/Vector';
import { IChunk } from '../../../src/World/Chunk';
import World, { CHUNK_WIDTH } from '../../../src/World/World';
import BasicLayer, { BasicTiles, basicTiles } from '../Layers/BasicLayer';
import { chain } from 'lodash';

export default class StreamingCheckerboardWorld extends World {

  constructor() {
    super(new BasicLayer(BasicTiles.Ground), { streaming: true });
  }

  serialize(): string {
    return "";
  }

  unserialize(data: string): StreamingCheckerboardWorld {
    return new StreamingCheckerboardWorld();
  }

  populateChunk(x: number, y: number, chunk: IChunk) {
    for(let xx = 0; xx < CHUNK_WIDTH; xx++) {
      for(let yy = 0; yy < CHUNK_WIDTH; yy++) {
        if((xx + yy) % 2 == 0) {
          chunk.setTile(xx, yy, basicTiles[BasicTiles.Wall]);
        }
      }
    }
  }
}