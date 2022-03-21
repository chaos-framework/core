import {
  Entity,
  ProcessEffect,
  ProcessEffectRunner,
  Action,
  ProcessEffectKey
} from '../internal.js';
import { ProcessEffectGenerator } from './Effect.js';

export interface Event extends ProcessEffectRunner {
  // TODO add ID for the client's sake
  previous?: {
    action: Action;
    effectType: ProcessEffectKey;
  };
  caster?: Entity;

  run(): ProcessEffectGenerator;
}
