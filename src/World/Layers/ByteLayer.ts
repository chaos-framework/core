import { Layer } from '../../internal.js';

const min = 0, max = 255;

export default class ByteLayer extends Layer<number> {
  constructor(fill: number) {
    super(fill);
  }

  // Clamp to 0-255
  setTile(x: number, y: number, tile: number) {
    super.setTile(x, y, tile <= min ? min : tile >= max ? max : tile);
  }
}
