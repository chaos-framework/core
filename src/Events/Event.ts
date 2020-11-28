import Entity from "../EntityComponent/Entity";
import Action from "./Action";

export default class Event {
  actions: (Action|undefined)[] = [];
  caster?: Entity;
  executed = false; // prevent double executions

  constructor(actions?: (Action|undefined)[]) {
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
      if(a) {
        a.execute();
      }
    }
    this.executed = true;
  }

}
