import { CHUNK_WIDTH, IChunk } from './Chunk';

// Layers

export default abstract class Layer<T extends IChunk> {
  chunks = new Map<string, T>();

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

