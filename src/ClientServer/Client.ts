import { Player } from "../internal";

export default interface Client {
  player: Player; // keep a reference for the player, so it can clean up on unexpected loss of connection
  broadcast(message: string | Object): boolean;
  addToGroup(group: string): boolean; // take advantage of group broadcasts, if protocol supports
  removeFromGroup(group: string): boolean;  // take advantage of group broadcasts, if protocol supports
  disconnect(): boolean;  // disconnects the player, returns true if successful
}