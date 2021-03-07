import { IEntity, Action } from "../internal";

export default interface Event {
  // TODO add ID for the client's sake
  caster?: IEntity;

  getNextAction(previousAction?: Action): Action | undefined;
}
