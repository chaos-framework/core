import Entity from "../EntityComponent/Entity";
import Action from "./Action";

export default class Event {
  actions: Action[] = [];
  caster?: Entity;

  constructor(actions?: Action[]) {
    if(actions) {
      this.actions = actions;
    }
  }

  fire() {
    // TODO iterate over actions and fire off sequentially
  }
}