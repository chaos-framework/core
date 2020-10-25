import Entity from './Entity';

export default class Slot {
  size: number;
  items: Entity[];

  constuctor(size: number) {
    this.size = size;
    this.items = new Entity[](size);
  }
}