import { runInThisContext } from "vm";

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

  // TODO distance, cast ray between two points, etc
}