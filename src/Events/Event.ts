import { Entity, ActionEffect, EffectGenerator, Effect } from "../internal.js";

export interface Event extends EffectGenerator<ActionEffect> {
  // TODO add ID for the client's sake
  caster?: Entity;

  run(): Generator<ActionEffect, boolean>;
  runPrivate(): Generator<ActionEffect, boolean> | undefined;
}
