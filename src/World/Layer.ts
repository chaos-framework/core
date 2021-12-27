import { Vector, Chunk } from '../internal.js';
const CHUNK_WIDTH = 16;

type ExtractLayoutParameter<T extends Chunk<any>> = T extends Chunk<infer U> ? U: never;

export abstract class Layer<T extends Chunk<any>> {
  chunks = new Map<string, T>();
  fill: any;

  constructor(fill: any) {
    this.fill = fill;
  }

  // TODO events for setting tiles
  set(x: number, y: number, value: ExtractLayoutParameter<T>) {
    const chunk = this.getChunk(x, y);
    if(chunk) {
      const relativeX = x % CHUNK_WIDTH;
      const relativeY = y % CHUNK_WIDTH;
      chunk.setTile(relativeX, relativeY, value);
    }
  }

  get(x: number, y: number): ExtractLayoutParameter<T> | undefined {
    const chunk = this.getChunk(x, y);
    if(chunk) {
      const relativeX = x % CHUNK_WIDTH;
      const relativeY = y % CHUNK_WIDTH;
      return chunk.getTile(relativeX, relativeY);
    }
    return undefined;
  };

  // Get the chunk that the absolute x/y coordinates fall under
  getChunk(x: number, y: number): Chunk<ExtractLayoutParameter<T>> | undefined {
    const key = new Vector(x, y).toChunkSpace().getIndexString();
    const chunk = this.chunks.get(key);
    if(chunk) {
      return chunk;
    }
    return undefined;
  }

  forgetChunk(key: string) {
    this.chunks.delete(key);
  }

  drawSquare(value: ExtractLayoutParameter<T>, topLeft: Vector, width: number, height?: number) {
    for(let x = topLeft.x; x < topLeft.x + width; x++) {
      for(let y = topLeft.y; y < topLeft.y + (height || width); y++) {
        this.set(x, y, value);
      }
    }
  }

  drawLine(value: ExtractLayoutParameter<T>, start: Vector, end: Vector) {
    const line = start.getLineToIterable(end);
    for(const vector of line) {
      this.set(vector.x, vector.y, value);
    }
  }

}
