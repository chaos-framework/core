import { IEntity, Action } from "../internal";

export default interface Event {
  caster?: IEntity;

  getNextAction(previousAction?: Action): Action | undefined;
}
