import { identity } from "lodash";
import { Entity, Action, SensoryInformation, Component, SenseEntityAction, NestedMap } from "../internal";

export interface Identifiable {
  id: string;
}

// CORE INTERFACES & TYPE GUARDS
export type ComponentType = 'sensor' | 'roller' | 'modifier' | 'reacter';

export interface Modifier {
  modify(a: Action): void; // TODO determine return type..
}

export interface Reacter {
  react(a: Action): void; // TODO determine return type..
}

export interface Anticipator {
  anticipate(a: Action): boolean;
}

export interface Sensor {
  sensedEntities: NestedMap<Entity>;
  sense(a: Action): SensoryInformation | boolean;
}

export interface Listener extends Modifier, Reacter { 
  sense(a: Action): SensoryInformation | boolean;
}

export function isModifier(o: any): o is Modifier {
  return o.modify !== undefined;
}

export function isReacter(o: any): o is Reacter {
  return o.react !== undefined;
}

export function isAnticipator(o: any): o is Anticipator {
  return o.anticipate !== undefined;
}

export function isSensor(o: any): o is Sensor {
  return o.sense !== undefined;
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
