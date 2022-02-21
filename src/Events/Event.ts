import { Entity, ActionEffect, ActionEffectRunner } from '../internal.js';

export interface Event extends ActionEffectRunner {
  // TODO add ID for the client's sake
  caster?: Entity;

  run(): Generator<ActionEffect, boolean>;
}
