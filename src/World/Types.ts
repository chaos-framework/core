import { clamp } from 'lodash';
import { Chunk } from "../internal.js"

// Clamps values from 0-255 and serializes them efficiently
export class ShortChunk extends Chunk<number> {
  // Only allow values 0-255
  setTile(x: number, y: number, tile: number) {
    super.setTile(x, y, clamp(tile, 0, 255));
  }

  // Convert to ASCII chars based on 0-255 values
  serialize(): string {
    return String.fromCharCode.apply(null, this.toArray());
  }
}
