import { ArrayChunk, ByteLayer, World } from '../internal.js';

export class ClientWorld extends World {
  ephemeral = true;

  constructor({id, name, size, baseLayer }: World.ConstructorParams) {
    super({id, name, size, baseLayer, streaming: true});
  }

  initializeChunk(x: number, y: number, data?: { base: any, [key: string]: any }) {
    this.baseLayer.setChunk(x, y, new ArrayChunk<number>(0, data?.['base']));
  }

  serialize(): string { return '' }
}
