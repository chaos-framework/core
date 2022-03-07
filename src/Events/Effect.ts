import { Action } from '../internal.js';

export type Effect = readonly [string, any];

export type EffectGenerator<T = Effect, R = any, N = any> = Generator<T, R, N>;
export type EffectRunner<T extends Effect = Effect, R = any, N = any> = {
  run(): EffectGenerator<T, R, N>;
};

export type ActionHandler<T extends Action = Action> = (
  action: T,
  ...params: any[]
) => EffectGenerator;

export type Immediate = readonly ['IMMEDIATE', EffectRunner];
export type Followup = readonly ['FOLLOWUP', EffectRunner];
export type Delay = readonly ['DELAY', number];

export type Permit = readonly ['PERMIT', number];
export type Deny = readonly ['DENY', number];

export type ActionEffect = Immediate | Followup | Delay;
export type ActionEffectKey = Pick<ActionEffect, 0>[0];
export type ActionEffectGenerator = EffectGenerator<ActionEffect, boolean>;
export type ActionEffectRunner = EffectRunner<ActionEffect, boolean>;
