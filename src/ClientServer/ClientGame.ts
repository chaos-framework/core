import { Game } from '../internal';

// Simple concrete implementation of abstract Game class -- for 
export default class ClientGame extends Game {
  constructor() {
    super();
  }

  initialize() {}
  onPlayerConnect() {}
  onPlayerDisconnect() {}
}
