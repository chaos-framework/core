import { CHUNK_WIDTH } from '../World/World';

export default class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: Vector): boolean {
    return other.x === this.x && other.y === this.y;
  }

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  copy(v: Vector): Vector {
    return new Vector(v.x, v.y);
  }

  toChunkSpace(): Vector {
    return new Vector(Math.floor(this.x / 16), Math.floor(this.y / 16));
  }

  differentChunkFrom(other: Vector): boolean {
    return !this.toChunkSpace().equals(other.toChunkSpace());
  }

  // TODO distance, cast ray between two points, etc
}