import { Entity, Action } from "../internal";

export default interface Event {
  caster?: Entity;

  getNextAction(previousAction?: Action): Action | undefined;
}
