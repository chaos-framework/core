import { Chunk, CHUNK_WIDTH, Vector } from "../../internal.js";

export class ArrayChunk<T> implements Chunk<T> {
  data: T[][] = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]; // 16 x 16

  constructor(fill: T, data?: T[]) {
    if (data !== undefined) {
      this.fillFromArray(data);
    } else {
      // Fill the chunk with an instance of a tile
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let y = 0; y < CHUNK_WIDTH; y++) {
          this.setTile(x, y, fill);
        }
      }
    }
  }

  setTile(x: number, y: number, tile: T) {
    if (x < 0 || x >= 16 || y < 0 || y >= 16) {
      throw Error();
    }
    this.data[x][y] = tile;
  }

  getTile(x: number, y: number): T | undefined {
    if (x < 0 || x >= 16 || y < 0 || y >= 16) {
      throw Error();
    }
    return this.data[x][y];
  }

  toArray(): T[] {
    let a = []
    for (let y = 0; y < CHUNK_WIDTH; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        a.push(this.data[x][y]);
      }
    }
    return a;
  }

  fillFromArray(data: T[]) {
    for (let y = 0; y < CHUNK_WIDTH; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        this.data[x][y] = data[x + (y * CHUNK_WIDTH)];
      }
    }
  }

  each(callback: (tile: T) => T): void {
    let a = [];
    for (let y = 0; y < CHUNK_WIDTH; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        this.data[x][y] = callback(this.data[x][y]);
      }
    }
  }

  serialize(): T[] {
    return this.toArray();
  }

}
