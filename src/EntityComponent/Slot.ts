import { Entity } from '../internal';

export default class Slot {
  size: number;
  items: Entity[] = [];

  constructor(size: number) {
    this.size = size;
  }
}