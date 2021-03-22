import { Entity, Action } from "../internal";

export default interface Event {
  // TODO add ID for the client's sake
  caster?: Entity;

  getNextAction(previousAction?: Action): Action | undefined;
}
