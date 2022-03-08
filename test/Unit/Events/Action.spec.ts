import { expect } from 'chai';
import 'mocha';

import { Action, ProcessEffectGenerator } from '../../../src/internal.js';

// Fake concrete implementation
class TestAction extends Action {
  *apply(): ProcessEffectGenerator {
    return true;
  }
}

describe('Action Abstract Functionality', () => {
  describe('Feasiblity callbacks', () => {
    // TODO
  });

  describe('Permits or forbids actions intelligently', () => {
    let a: TestAction;
    beforeEach(() => {
      a = new TestAction();
    });

    it('Permits actions by default', () => {
      expect(a.permitted).to.be.true;
    });

    it('Decides actions are permitted if no components have attempted to permit or deny', () => {
      a.decidePermission();
      expect(a.permitted).to.be.true;
    });

    it('Allows for denial', () => {
      a.addPermission(false);
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });

    it('Accepts highest priority permit/deny', () => {
      a.addPermission(false, { priority: 0 });
      a.decidePermission();
      expect(a.permitted).to.be.false;
      a.addPermission(true, { priority: 1 });
      a.decidePermission();
      expect(a.permitted).to.be.true;
      a.addPermission(false, { priority: 1000 });
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });

    it('When permitted and denied with same priority, yields to denial', () => {
      a.addPermission(true);
      a.addPermission(false);
      a.addPermission(true);
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });
  });
});
