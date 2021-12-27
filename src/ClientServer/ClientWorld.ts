import { ByteLayer, World } from '../internal.js';

export default class ClientWorld extends World {
  ephemeral = true;

  constructor({id, name, width, height, baseLayer }: World.ConstructorParams) {
    super({id, name, width, height, baseLayer, streaming: true});
  }

  initializeChunk(x: number, y: number) {
    
  }

  serialize(): string { return '' }
}
