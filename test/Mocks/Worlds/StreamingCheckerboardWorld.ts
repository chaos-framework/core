import { chunk } from 'lodash';
import { ArrayChunk, ByteLayer, Chunk, Vector, World } from '../../../src/internal.js';

import { BasicTiles, basicTiles } from '../Layers/BasicLayer.js';

const CHUNK_WIDTH = 16;

export default class StreamingCheckerboardWorld extends World {
  ephemeral = true;

  constructor(size?: Vector) {
    super({ baseLayer: new ByteLayer(BasicTiles.Air), streaming: true, size: size || Vector.max() });
  }

  serialize(): string {
    return "";
  }

  unserialize(data: string): StreamingCheckerboardWorld {
    return new StreamingCheckerboardWorld;
  }

  initializeChunk(x: number, y: number) {
    this.baseLayer.setChunk(x, y, this.populateChunk(new ArrayChunk<number>(BasicTiles.Air)));
  }

  populateChunk(chunk: ArrayChunk<number>): ArrayChunk<number> {
    for(let xx = 0; xx < CHUNK_WIDTH; xx++) {
      for(let yy = 0; yy < CHUNK_WIDTH; yy++) {
        if((xx + yy) % 2 == 0) {
          chunk.setTile(xx, yy, BasicTiles.Wall);
        }
      }
    }
    return chunk;
  }
}
