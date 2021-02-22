import { CONNECTION, CONNECTION_RESPONSE, Game } from '../internal';

// Simple concrete implementation of abstract Game class -- for 
export default class ClientGame extends Game {
  constructor() {
    super();
  }

  onPlayerConnect(msg: CONNECTION): CONNECTION_RESPONSE {
    throw new Error('This should never be called.');
  }
  onPlayerDisconnect() {}
}
