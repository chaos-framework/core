import { World } from '../internal.js';

export default class ClientWorld extends World {
  ephemeral = true;

  constructor({id, name, fill, width, height}: World.ConstructorParams) {
    super({id, name, fill, width, height, streaming: true});
  }

  serialize(): string { return ''; }
}
