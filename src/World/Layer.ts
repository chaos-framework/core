import { Vector, Chunk, IChunk } from '../internal.js';
const CHUNK_WIDTH = 16;

export default abstract class Layer<T> implements ILayer {
  chunks = new Map<string, Chunk<T>>();
  fill: any;

  constructor(fill: any) {
    this.fill = fill;
  }

  // TODO events for setting tiles
  setTile(x: number, y: number, tile: any) {
    const chunk = this.getChunk(x, y);
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
    const key = new Vector(x, y).toChunkSpace().getIndexString();
    const chunk = this.chunks.get(key);
    if(chunk) {
      return chunk;
    }
    return undefined;
  }

  // Initialize chunks, optionally with a base for context
  initializeChunk(x: number, y: number): IChunk {
    const k = new Vector(x, y).getIndexString();
    let chunk = this.chunks.get(k);
    if(chunk) {
      return chunk;
    } else {
      chunk = new Chunk<T>(this.fill);
      this.chunks.set(k, chunk);
      return chunk;
    }
  }

  forgetChunk(key: string) {
    this.chunks.delete(key);
  }

  drawSquare(value: T, topLeft: Vector, width: number, height?: number) {
    for(let x = topLeft.x; x < topLeft.x + width; x++) {
      for(let y = topLeft.y; y < topLeft.y + (height || width); y++) {
        this.setTile(x, y, value);
      }
    }
  }

  drawLine(value: T, start: Vector, end: Vector) {
    const line = start.getLineToIterable(end);
    for(const vector of line) {
      this.setTile(vector.x, vector.y, value);
    }
  }

}

export interface ILayer {
  setTile(x: number, y: number, tile: any): void;
  getTile(x: number, y: number): any | undefined;
  getChunk(x: number, y: number): IChunk | undefined;
  initializeChunk(x: number, y: number, base?: IChunk): IChunk;
  forgetChunk(key: string): void;
}
