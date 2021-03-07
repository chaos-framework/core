import { IEntity, Action } from "../internal";

// CORE INTERFACES
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

export interface Sensor {
  senseEntity(e: IEntity, a?: Action): object | undefined;
  senseAction(a: Action): object | undefined;
}

// TYPE GUARDS

export function isModifier(o: any): o is Modifier {
  return o.modify !== undefined;
}

export function isReacter(o: any): o is Reacter {
  return o.react !== undefined;
}

export function isSensor(o: any): o is Sensor {
  return o.senseEntity !== undefined && o.senseAction !== undefined;
}

// SCOPE

export enum Scope {
  Local,
  Nearby, // default for everything
  World,
  Player,
  Team,
  Game
}

export interface ComponentScope {
  sensor: Scope,
  // roller
  modifier: Scope,
  reacter: Scope,
  // perceiver?
}