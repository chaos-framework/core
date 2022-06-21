import { Queue } from "queue-typescript";
import { Player, MessageType } from "../internal.js";

export interface Client {
  // TODO a robust permission system of view/edit rights could be useful
    // permissions[]: string
    // getters on permissions, has() etc
  id: string;
  clientType: 'player' | 'admin';
  broadcastQueue: Queue<any>;
  broadcast(messageType: MessageType, message: string | Object): boolean;
  broadcastEnqueued(): boolean;
  disconnect(): boolean;  // disconnects the player, returns true if successful
}

export interface AdminClient extends Client {
  clientType: 'admin';
}

export interface PlayerClient extends Client {
  clientType: 'player';
  player: Player; // keep a reference for the player, so it can clean up on unexpected loss of connection
}
