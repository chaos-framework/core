export const CHUNK_WIDTH = 16;

export default abstract class Chunk<T> implements IChunk {
  tiles: T[][] = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]; // 16 x 16
  fill: T;

  constructor(fill: T) {
    this.fill = fill;
    // Fill the chunk with an instance of a tile
    for(let x = 0; x < CHUNK_WIDTH; x++) {
      for(let y = 0; y < CHUNK_WIDTH; y++) {
        this.setTile(x,y,fill);
      }
    }
  }

  setTile(x: number, y: number, tile: T) {
    if(x < 0 || x >= 16 || y < 0 || y >= 16) {
      throw Error();
    }
    this.tiles[x][y] = tile;
  }

  getTile(x: number, y: number): T | undefined {
    if(x < 0 || x >= 16 || y < 0 || y >= 16) {
      throw Error();
    }
    return this.tiles[x][y];
  }

  toArray(): T[] {
    let a = []
    for(let x = 0; x < CHUNK_WIDTH; x++) {
      for(let y = 0; y < CHUNK_WIDTH; y++) {
        a.push(this.tiles[x][y]);
      }
    }
    return a;
  }

  map(callback: (tile: T) => T): void {
    let a = [];
    for(let x = 0; x < CHUNK_WIDTH; x++) {
      for(let y = 0; y < CHUNK_WIDTH; y++) {
        this.tiles[x][y] = callback(this.tiles[x][y]);
      }
    }
  }

  stringify(callback: (tile: T) => string): string {
    let a = [];
    for(let x = 0; x < CHUNK_WIDTH; x++) {
      for(let y = 0; y < CHUNK_WIDTH; y++) {
        a.push(callback(this.tiles[x][y]));
      }
    }
    return a.join('');
  }

  abstract serialize(): string;
}

export interface IChunk {
  setTile(x: number, y: number, tile: any): void;
  getTile(x: number, y: number): any | undefined;
}
