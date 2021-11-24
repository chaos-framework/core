import { Entity } from '../internal.js';

export default class Slot {
  size: number;
  items: Entity[] = [];

  constructor(size: number) {
    this.size = size;
  }
}