import { Player, MessageType } from "../internal.js";

export interface Client {
  player: Player; // keep a reference for the player, so it can clean up on unexpected loss of connection
  broadcast(messageType: MessageType, message: string | Object): boolean;
  disconnect(): boolean;  // disconnects the player, returns true if successful
}
