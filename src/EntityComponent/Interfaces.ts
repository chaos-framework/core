import { IEntity, Action } from "../internal";

// CORE INTERFACES
export type ComponentType = 'Sensor' | 'Roller' | 'Modifier' | 'Reacter';

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

export type Scope = 'entity' | 'world' | 'player' | 'team' | 'game';

export interface ComponentScope {
  sensor?: Scope,
  // roller
  modifier?: Scope,
  reacter?: Scope,
  // perceiver?
}
