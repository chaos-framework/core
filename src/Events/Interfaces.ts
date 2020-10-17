import Action from './Action';

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