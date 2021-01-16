import { Action } from '../internal';

export interface Listener {
  modify(a: Action): void;
  react(a: Action): void;
}
export interface Modifier {
  modify(a: Action): void; // TODO determine return type..
}

export interface Reacter {
  react(a: Action): void; // TODO determine return type..
}


export function isModifier(o: any): o is Modifier {
  return o.modify !== undefined;
}

export function isReacter(o: any): o is Reacter {
  return o.react !== undefined;
}
