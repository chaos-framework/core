import { ArrayChunk, Layer } from "../../../src/internal.js";

export interface AtmosphericComposition {
  O2: number;
  N2: number;
  H2: number;
  CO2: number;
  Ne: number;
  Ar: number;
  other?: number;
}

export const earthAtmosphere = {
  O2: 20.95,
  N2: 78.08,
  H2: 0,
  CO2: 0.04,
  Ne: 0,
  Ar: 0.93
}

export default class Atmosphere extends Layer<ArrayChunk<AtmosphericComposition>> {
  // TODO actually implement flywheel pattern -- override set
}