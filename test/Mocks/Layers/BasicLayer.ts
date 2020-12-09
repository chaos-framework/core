import Chunk, { IChunk } from '../../../src/World/Chunk';
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

export enum Tiles {
  Air, Ground, Wall
}

export default class BasicLayer extends Layer<BasicTile> {
  constructor(fill: number) {
    super(BasicLayer.getTileFromInt(fill));
  }

  setTile(x: number, y: number, tile: number) {
    super.setTile(x, y, BasicLayer.getTileFromInt(tile));
  }

  static getTileFromInt(i: number) {
    if (i >= 0 && i < tiles.length) {
      return tiles[i];
    } else {
      // TODO log error?
      return tiles[0];
    }
  }

  initializeChunk(x: number, y: number, base?: IChunk): void {};
}
