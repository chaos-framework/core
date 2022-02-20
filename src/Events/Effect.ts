export type Effect = readonly [ string, any ]

export type EffectGenerator<T extends Effect, R = any, N = any> = Generator<T, R, N>
export type EffectRunner<T extends Effect, R = any, N = any> = {
  run(): Generator<T, R, N>
}

export type Immediate = readonly [ 'IMMEDIATE', EffectRunner<ActionEffect> ]
export type Followup = readonly  ['FOLLOWUP', EffectRunner<ActionEffect> ]
export type Delay = readonly [ 'DELAY', number ]

export type ActionEffect = Immediate | Followup | Delay;
export type ActionEffectGenerator = EffectGenerator<ActionEffect, boolean>;
