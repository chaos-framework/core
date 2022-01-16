export const CHUNK_WIDTH = 16;

export interface Chunk<T> {
  setTile(x: number, y: number, tile: T): void;
  getTile(x: number, y: number): any | undefined;
  toArray(): any[];
  each(callback: (tile: T) => any): void;
  serialize(): any;
}
