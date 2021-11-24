import { Layer } from '../../../src/internal.js';

interface BasicTile {
  name: string,
  height: number,
  floor: boolean
}

export const basicTiles: readonly BasicTile[] = Object.freeze([
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

export enum BasicTiles {
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
    if (i >= 0 && i < basicTiles.length) {
      return basicTiles[i];
    } else {
      // TODO log error?
      return basicTiles[0];
    }
  }
}
