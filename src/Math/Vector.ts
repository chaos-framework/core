import { clamp, isInteger } from 'lodash';
import { toInteger } from 'lodash';

const CHUNK_WIDTH = 16;

export default class Vector {
  x: number;
  y: number;

  static fromIndexString(s: string): Vector {
    const values = s.split('_').map(v => toInteger(v));
    if (values.length < 2) {
      throw new Error();
    }
    return new Vector(toInteger(values[0]), toInteger(values[1]));
  }

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

  // Clamps to zero-based square of size given
  clamp(size?: Vector): Vector {
    return new Vector(clamp(this.x, 0, size ? size.x : Number.MAX_VALUE), clamp(this.y, 0, size ? size.y : Number.MAX_VALUE));
  }

  copyAdjusted(x: number, y: number): Vector {
    return new Vector(this.x + x, this.y + y);
  }

  toChunkSpace(): Vector {
    return new Vector(Math.floor(this.x / CHUNK_WIDTH), Math.floor(this.y / CHUNK_WIDTH));
  }

  toChunkSpaceCeil(): Vector {
    return new Vector(Math.ceil(this.x / CHUNK_WIDTH), Math.ceil(this.y / CHUNK_WIDTH));
  }

  toBaseZero(): Vector {
    return new Vector(this.x > 0 ? this.x - 1 : 0, this.y > 0 ? this.y - 1 : 0)
  }

  differentChunkFrom(other: Vector): boolean {
    return !this.toChunkSpace().equals(other.toChunkSpace());
  }

  getIndexString(): string {
    return this.x.toString() + "_" + this.y.toString();
  }

  serialize(): string {
    return this.getIndexString();
  }

  static unserialize(s: string): Vector {
    return Vector.fromIndexString(s);
  }

  static zero(): Vector {
    return new Vector(0, 0);
  }

  // TODO distance, cast ray between two points, etc
}