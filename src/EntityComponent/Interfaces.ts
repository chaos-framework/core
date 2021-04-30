import { identity } from "lodash";
import { Entity, Action, SensoryInformation, Component, SenseEntityAction } from "../internal";

// CORE INTERFACES & TYPE GUARDS
export type ComponentType = 'sensor' | 'roller' | 'modifier' | 'reacter';

export interface Modifier {
  modify(a: Action): void; // TODO determine return type..
}

export interface Reacter {
  react(a: Action): void; // TODO determine return type..
}

export interface Sensor {
  sense(a: Action): SensoryInformation | boolean;
}

export interface Listener extends Sensor, Modifier, Reacter { }

export function isModifier(o: any): o is Modifier {
  return o.modify !== undefined;
}

export function isReacter(o: any): o is Reacter {
  return o.react !== undefined;
}

export function isSensor(o: any): o is Sensor {
  return o.senseEntity !== undefined && o.senseAction !== undefined;
}

// COMPONENT CONTAINERS

export interface SensoryStorage { // lol
  sensedEntities: Map<string, Entity>;
  senseEntity({target, using, tags}: SenseEntityAction.EntityParams): SenseEntityAction;
  _senseEntity(entity: Entity, using: Component): boolean;
}

// SCOPE

export type Scope = 'entity' | 'world' | 'game'; // 'player' | 'team' | 'game';

export interface ComponentScope {
  sensor?: Scope,
  // roller
  modifier?: Scope,
  reacter?: Scope,
  // perceiver?
}
