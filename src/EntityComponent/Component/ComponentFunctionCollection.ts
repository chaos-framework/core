import { Action, actionFunction } from '../../internal';

export class ComponentFunctionCollection {
  functions = new Map<string | number, actionFunction[]>();

  constructor() {}

  add(phase: string | number, fn: actionFunction) {
    const arr = this.functions.get(phase);
    if (arr === undefined) {
      this.functions.set(phase, [fn]);
    } else {
      arr.push(fn);
    }
  }

  do(phase: string | number, action: Action) {
    const arr = this.functions.get(phase);
    if (arr !== undefined) {
      for(const fn of arr) {
        fn(action);
      }
    }
  }
}
