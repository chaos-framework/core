export type Effect = [
  method: string,
  data: any
]

export type EffectGenerator<T extends Effect, R = any, N = any> = {
  run(): Generator<T, R, N>
}

export type Reaction = [
  method: 'REACTION',
  generator: ActionEffectGenerator
]

export type Followup = [
  method: 'FOLLOWUP',
  generator: ActionEffectGenerator
]

export type Break = [
  method: 'BREAK',
  milliseconds: number
]

export type ActionEffect = Reaction | Followup | Break;
export type ActionEffectGenerator = EffectGenerator<ActionEffect>
