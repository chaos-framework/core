import { IEntity } from "../internal";

export default class Inventory {
  size: number = 0;
  items: (IEntity | undefined)[] = [];

  constuctor(size: number = 0) {
    this.size = size;
    for(let i = 0; i < size; i++) {
      this.items.push(undefined);
      // TODO with accessors could do something more clever with this
    }
  }

}
