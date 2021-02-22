import { CONNECTION, CONNECTION_RESPONSE, Game, Player } from '../../../src/internal';

export default class EmptyGame extends Game {
  name = "Empty Game";

  initialize() {

  }

  onPlayerConnect(msg: CONNECTION): CONNECTION_RESPONSE {
    throw new Error();
  }

  onPlayerDisconnect() {
    
  }
  
}