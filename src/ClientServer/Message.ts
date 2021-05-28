
import { Game } from '../internal';
export interface Message {

}
export interface CONNECTION {
  desiredUsername: string,
  options?: any
}

export interface CONNECTION_RESPONSE {
  connectedPlayerId: string,
  gameState: Game.SerializedForClient
}
