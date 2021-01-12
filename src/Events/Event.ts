import Entity from "../EntityComponent/Entity";
import Action from "./Action";

export default interface Event {
  caster?: Entity;

  getNextAction(previousAction?: Action): Action | undefined;
}
