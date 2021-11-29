import { CONNECTION, CONNECTION_RESPONSE } from "../internal.js";

export interface Game {
  initialize(option: any): void;
  shutdown(): void | undefined;
  play(): void;
  onPlayerConnect(msg: CONNECTION): CONNECTION_RESPONSE;
  onPlayerDisconnect(option: any): void;
}

export function isGame(o: any): o is Game {
  return  typeof o.initialize === 'function' &&
          typeof o.play === 'function' &&
          typeof o.onPlayerConnect === 'function' &&
          typeof o.onPlayerDisconnect === 'function' &&
          (typeof o.shutdown === 'function' || typeof o.shutdown === 'undefined')
}
