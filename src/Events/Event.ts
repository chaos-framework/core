import { Entity, ActionEffect, EffectRunner } from "../internal.js";

export interface Event extends EffectRunner<ActionEffect> {
  // TODO add ID for the client's sake
  caster?: Entity;

  run(): Generator<ActionEffect, boolean>;
  runPrivate(): Generator<ActionEffect, boolean> | undefined;
}
