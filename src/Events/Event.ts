import { Entity, ActionEffect, ActionEffectRunner, Action, ActionEffectKey } from '../internal.js';

export interface Event extends ActionEffectRunner {
  // TODO add ID for the client's sake
  previous?: {
    action: Action;
    effectType: ActionEffectKey;
  };
  caster?: Entity;

  run(): Generator<ActionEffect, boolean>;
}
