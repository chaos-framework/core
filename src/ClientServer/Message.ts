import { Chaos } from '../internal.js';

// Connection

export interface CONNECTION {
  desiredUsername: string,
  options?: any
}

export interface CONNECTION_RESPONSE {
  connectedPlayerId: string,
  gameState: Chaos.SerializedForClient
}

// In-game

interface Command {
  clientId: string,
  uuid: string,
  time: Date,
}

export interface CAST extends Command {
  casterType: 'entity' | 'player' | 'team',
  casterId: string,
  abilityName: string,
  grantedBy?: string,
  using?: string,
  params?: { [key: string]: string }
}

export interface WHISPER extends Command {
  recipientId: string,
  message: string
}
