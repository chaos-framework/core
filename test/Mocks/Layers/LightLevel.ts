import { ArrayChunk, Layer } from "../../../src/internal.js";

const min = 0, max = 7;

export default class LightLevel extends Layer<ArrayChunk<number>> {
  // Clamp to 0-7
  set(x: number, y: number, tile: number) {
    super.set(x, y, tile <= min ? min : tile >= max ? max : tile);
  }
}
