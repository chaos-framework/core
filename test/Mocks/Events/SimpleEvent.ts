import {
  Action,
  ActionEffect,
  ActionEffectGenerator,
  Event
} from '../../../src/internal.js';

export class SimpleEvent implements Event {
  index = 0;

  constructor(private actions: Action[]) {}

  *run(): ActionEffectGenerator {
    for (const action of this.actions) {
      yield Action.immediate(action);
    }
    return true;
  }
}
