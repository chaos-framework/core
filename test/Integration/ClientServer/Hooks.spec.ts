import { expect } from 'chai';
import 'mocha';

import { Action, Chaos, Hook, LogicalAction } from '../../../src/internal';

describe('Hooks', function() {
  beforeEach(function() {
    Chaos.reset();
  });

  it('Successfully subscribes to actions when applied', function() {
    let actionsSeen = 0;
    const testHook = (action: Action) => { actionsSeen++ };
    Chaos.attachHook(testHook);
    Chaos.queueActionForProcessing(new LogicalAction('TEST'));
    Chaos.queueActionForProcessing(new LogicalAction('TEST'));
    Chaos.queueActionForProcessing(new LogicalAction('TEST'));
    Chaos.process();
    expect(actionsSeen).to.equal(3);
  });
});