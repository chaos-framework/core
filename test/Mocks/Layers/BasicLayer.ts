import Chunk from '../../../src/World/Chunk';
import Layer from '../../../src/World/Layer';

interface BasicTile {
  name: string,
  height: number,
  floor: boolean
}

const tiles: readonly BasicTile[] = Object.freeze([
  {
    name: 'Air',  // Name
    height: 0,    // Height
    floor: false  // Can be stood on
  },
  {
    name: 'Ground',
    height: 0,
    floor: true
  },
  {
    name: 'Wall',
    height: 5,
    floor: true
  }
]);

class JSONChunk extends Chunk<any> {
  serialize() {
    return JSON.stringify(this.toArray());
  }
}

export default class BasicLayer extends Layer<JSONChunk> {
  setTile(x: number, y: number, tile: number) {
    if (tile >= 0 && tile < tiles.length) {
      super.setTile(x, y, tiles[tile]);
    } else {
      // TODO log error
      super.setTile(x, y, tiles[0]);
    }
  }
}
