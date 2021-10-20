import { CONNECTION, CONNECTION_RESPONSE } from "../internal";

export interface Game {
  initialize(option: any): void;
  onPlayerConnect(msg: CONNECTION): CONNECTION_RESPONSE;
  onPlayerDisconnect(option: any): void;
}

export function isGame(o: any): o is Game {
  return  typeof o.initialize === 'function' &&
          typeof o.onPlayerConnect === 'function' &&
          typeof o.onPlayerDisconnect === 'function'
}
