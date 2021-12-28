import { ArrayChunk, Layer } from "../../../src/internal";

export interface AtmosphericComposition {
  O2: number;
  N2: number;
  H2: number;
  CO2: number;
  Ne: number;
  Ar: number;
}

export default class BasicLayer extends Layer<ArrayChunk<AtmosphericComposition> {

}