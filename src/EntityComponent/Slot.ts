import { IEntity } from '../internal';

export default class Slot {
  size: number;
  items: IEntity[] = [];

  constructor(size: number) {
    this.size = size;
  }
}