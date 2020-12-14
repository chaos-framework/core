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

  copy(): Vector {
    return new Vector(this.x, this.y);
  }

  copyAdjusted(x: number, y: number): Vector {
    return new Vector(this.x + x , this.y + y);
  }

  toChunkSpace(): Vector {
    return new Vector(Math.floor(this.x / 16), Math.floor(this.y / 16));
  }

  differentChunkFrom(other: Vector): boolean {
    return !this.toChunkSpace().equals(other.toChunkSpace());
  }

  getIndexString(): string {
    return this.x.toString() + "_" + this.y.toString();
  }

  // TODO distance, cast ray between two points, etc
}