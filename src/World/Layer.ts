import Chunk, { CHUNK_WIDTH, IChunk } from './Chunk';

// Layers

export default abstract class Layer<T> implements ILayer {
  chunks = new Map<string, Chunk<T>>();
  fill: any;

  constructor(fill: any) {
    this.fill = fill;
  }

  setTile(x: number, y: number, tile: any) { 
    const chunk = this.getChunk(x, y);
    // TODO should load chunk if not defined -- someone can set a tile anywhere
    if(chunk) {
      const relativeX = x % CHUNK_WIDTH;
      const relativeY = y % CHUNK_WIDTH;
      chunk.setTile(relativeX, relativeY, tile);
    }
  }

  getTile(x: number, y: number): any | undefined {
    const chunk = this.getChunk(x, y);
    if(chunk) {
      const relativeX = x % CHUNK_WIDTH;
      const relativeY = y % CHUNK_WIDTH;
      return chunk.getTile(relativeX, relativeY);
    }
    return undefined;
  };

  // Get the chunk that the absolute x/y coordinates fall under
  getChunk(x: number, y: number): Chunk<T> | undefined {
    const chunkX = Math.floor(x / CHUNK_WIDTH);
    const chunkY = Math.floor(y / CHUNK_WIDTH);
    const key = Layer.getXYString(chunkX, chunkY);
    const chunk = this.chunks.get(key);
    if(chunk) {
      return chunk;
    }
    return undefined;
  }

  static getXYString(x: number, y: number): string {
    if(Number.isInteger(x) && Number.isInteger(y)) {
      return x.toString() + "_" + y.toString();
    }
    throw new Error();
  }

  // Initialize chunks, optionally with a base for context
  initializeChunk(x: number, y: number, base?: IChunk) {
    const k = Layer.getXYString(x, y);
    if(!this.chunks.has(k)) {
      this.chunks.set(k, new Chunk<T>(this.fill));
    }
  } 

}

export interface ILayer {
  setTile(x: number, y: number, tile: any): void;
  getTile(x: number, y: number): any | undefined;
  getChunk(x: number, y: number): IChunk | undefined;
  initializeChunk(x: number, y: number, base?: IChunk): void;
}
