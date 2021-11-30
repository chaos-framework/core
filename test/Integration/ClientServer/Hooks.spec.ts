import { expect } from 'chai';
import 'mocha';

import { Action, Chaos, LogicalAction, ActionHook, ExecutionHook } from '../../../src/internal.js';

describe('Hooks', function() {
  beforeEach(function() {
    Chaos.reset();
  });

  describe('Action hooks', function() {
    it('Successfully subscribes to actions when applied', function() {
      let callCount = 0;
      const testHook: ActionHook = (action: Action) => { callCount++ };
      Chaos.attachActionHook(testHook);
      Chaos.processor.enqueue(new LogicalAction('TEST'));
      Chaos.processor.enqueue(new LogicalAction('TEST'));
      Chaos.processor.enqueue(new LogicalAction('TEST'));
      Chaos.processor.process();
      expect(callCount).to.equal(3);
    })
  });

  describe('Execution hooks', function() {
    it('Successfully subscribes to execution completion when applied', function() {
      let callCount = 0;
      let totalActions = 0;
      const testHook: ExecutionHook = (actions: Action[]) => { callCount++; totalActions = actions.length; };
      Chaos.attachExecutionHook(testHook);
      Chaos.processor.enqueue(new LogicalAction('TEST'));
      Chaos.processor.enqueue(new LogicalAction('TEST'));
      Chaos.processor.enqueue(new LogicalAction('TEST'));
      Chaos.processor.process();
      expect(callCount).to.equal(1);
      expect(totalActions).to.equal(3);
    })
  });
});