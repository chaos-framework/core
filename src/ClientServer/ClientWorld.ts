import { ByteLayer, World } from '../internal.js';

export default class ClientWorld extends World {
  ephemeral = true;

  constructor({id, name, size, baseLayer }: World.ConstructorParams) {
    super({id, name, size, baseLayer, streaming: true});
  }

  initializeChunk(x: number, y: number) {
    
  }

  serialize(): string { return '' }
}
