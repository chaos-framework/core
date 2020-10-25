import Entity from "../EntityComponent/Entity";
import Action from "./Action";

export default class Event {
  actions: Action[] = [];
  caster?: Entity;
  executed = false; // prevent double executions

  constructor(actions?: Action[]) {
    if(actions) {
      this.actions = actions;
    }
  }

  execute() {
    // Don't execute twice
    if(this.executed) {
      // TODO throw error
      return;
    }
    for(let a of this.actions) {
      a.execute();
    }
    this.executed = true;
  }

}
