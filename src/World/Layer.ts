import World from './World';

// Layers

export default abstract class Layer<T extends IChunk> {
  chunks = new Map<string, T>();
  abstract update(): void;

  setTile(x: number, y: number, tile: any) { 
    const chunk = this.getChunk(x, y);
    const relativeX = x % CHUNK_WIDTH;
    const relativeY = y % CHUNK_WIDTH;
    chunk.setTile(relativeX, relativeY, tile);
  }

  getTile(x: number, y: number): any {
    const chunk = this.getChunk(x, y);
    const relativeX = x % CHUNK_WIDTH;
    const relativeY = y % CHUNK_WIDTH;
    return chunk.getTile(relativeX, relativeY);
  };

  // Get the chunk that the absolute x/y coordinates fall under
  getChunk(x: number, y: number): T {
    const chunkX = Math.floor(x / CHUNK_WIDTH);
    const chunkY = Math.floor(y / CHUNK_WIDTH);
    const key = Layer.getXYString(chunkX, chunkY);
    const chunk = this.chunks.get(key);
    if(chunk) {
      return chunk;
    }
    throw new Error();
  }

  static getXYString(x: number, y: number): string {
    if(Number.isInteger(x) && Number.isInteger(y)) {
      return x.toString() + "_" + y.toString();
    }
    throw new Error();
  }

}

export interface ILayer {
  setTile(x: number, y: number, tile: any): void;
  getTile(x: number, y: number): any;
  getChunk(x: number, y: number): IChunk;
}

// Chunks (16x16 tiles)
export const CHUNK_WIDTH = 16;

export abstract class Chunk<T> implements IChunk {
  tiles: T[][] = [[]];

  constructor(fill?: T) {
    // Fill the chunk with an instance of a tile
    if(fill) {
      for(let x = 0; x < CHUNK_WIDTH; x++) {
        for(let y = 0; y < CHUNK_WIDTH; y++) {
          this.tiles[x][y] = fill;
        }
      }
    }
  }

  setTile(x: number, y: number, tile: T) {
    if(x < 0 || x >= 16 || y < 0 || y >= 16) {
      this.tiles[x][y] = tile;
    }
    throw Error();
  }

  getTile(x: number, y: number): T {
    if(x < 0 || x >= 16 || y < 0 || y >= 16) {
      return this.tiles[x][y];
    }
    throw Error();
  }
}

export class ShortChunk extends Chunk<number> {
  constructor(fill: number = 0) {
    super(fill);
  }
}

export class ShortLayer extends Layer<ShortChunk> {
  update() {
    
  }
}

export interface IChunk {
  setTile(x: number, y: number, tile: any): void;  // TODO make action generator
  getTile(x: number, y: number): any;
}

export const s = new ShortLayer();
const a:number = s.getTile(0,0);
