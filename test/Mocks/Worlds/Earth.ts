import { World, ByteLayer, ArrayChunk, Layer, Vector } from '../../../src/internal.js';
import Atmosphere, { AtmosphericComposition, earthAtmosphere } from '../Layers/Atmosphere.js';
import LightLevel from '../Layers/LightLevel.js';

export default class Earth extends World {
  atmosphere: Atmosphere;
  lightLevel: LightLevel;

  constructor() {
    super({
      streaming: true,
      baseLayer: new ByteLayer(0),
      additionalLayers: new Map<string, Layer<any>>([
        ['atmosphere', new Atmosphere(earthAtmosphere)],
        ['lightLevel', new LightLevel(0)]
      ])
    });
    this.atmosphere = this.layers.get('atmosphere')!;
    this.lightLevel = (this.layers.get('lightLevel')! as LightLevel); // obnoxious, maybe should refactor assigning within super constructor
  }

  initializeChunk(x: number, y: number): void {
    this.baseLayer.setChunk(x, y, new ArrayChunk<number>(0));
    this.atmosphere.setChunk(x, y, new ArrayChunk<AtmosphericComposition>(earthAtmosphere));
    this.lightLevel.setChunk(x, y, new ArrayChunk<number>(1));
  }

  serialize(): string {
    return '';
  }
}
