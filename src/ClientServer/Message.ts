import { Game } from '../internal';

export default interface Message {

}

export enum MessageTypes {
  CONNECTION = 'CONNECTION',
  CONNECTION_RESPONSE = 'CONNECTION_RESPONSE',
  SAY = 'SAY',
  WHISPER = 'WHISPER',
  CAST = 'CAST'
}

export interface CONNECTION {
  desiredUsername: string,
  options?: any
}

export interface CONNECTION_RESPONSE {
  connectedPlayerId: string,
  gameState: Game.SerializedForClient
}
