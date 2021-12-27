import { Layer, ArrayChunk } from '../../internal.js';

const min = 0, max = 255;

export class ByteLayer extends Layer<ArrayChunk<number>> {
  constructor(fill: number) {
    super(fill);
  }

  // Clamp to 0-255
  set(x: number, y: number, tile: number) {
    super.set(x, y, tile <= min ? min : tile >= max ? max : tile);
  }
}
