import { expect } from 'chai';
import 'mocha';

import {
  processRunner,
  Event,
  ActionEffectGenerator,
  ActionEffect,
  Action
} from '../../../src/internal.js';

class EffectEvent implements Event {
  effects: ActionEffect[];

  constructor(...effects: ActionEffect[]) {
    this.effects = effects;
  }

  *run(): ActionEffectGenerator {
    for (const effect of this.effects) {
      yield effect;
    }
    return true;
  }
}

abstract class NumberedAction extends Action {
  constructor(public index: number = 1) {
    super();
  }
}

class NoEffectAction extends NumberedAction {
  *apply(): ActionEffectGenerator {
    return true;
  }
}

class ImmediateAction extends NumberedAction {
  *apply(): ActionEffectGenerator {
    yield this.react(new NoEffectAction(this.index + 1));
    return true;
  }
}

class FollowupAction extends NumberedAction {
  *apply(): ActionEffectGenerator {
    yield this.followup(new NoEffectAction(this.index + 1));
    return true;
  }
}

describe('Processing actions', function () {
  it('Processes actions and events in the expected order', async function () {
    let event = new EffectEvent(new NoEffectAction(1).effect());
    let result = (await processRunner(event)) as NumberedAction[];
    expect(result.length).to.equal(1);
    expect(result[0].index).to.equal(1);
    event = new EffectEvent(
      new NoEffectAction(1).effect(),
      new ImmediateAction(2).effect(),
      new FollowupAction(4).effect()
    );
    result = (await processRunner(event)) as NumberedAction[];
    expect(result.map((a) => a.index)).to.eql([1, 3, 2, 4, 5]);
  });
});
