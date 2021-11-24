import { expect } from 'chai';
import 'mocha';

import { Action } from '../../../src/internal.js';

// Fake concrete implementation
class TestAction extends Action {
  apply(): boolean {
    return true;
  }
}

describe('Action Abstract Functionality', () => {

  describe('Feasiblity callbacks', () => {
    // TODO
  });

  describe('Permits or forbids actions intelligently', () => {
    let a: TestAction;
    beforeEach(() => { a = new TestAction() });

    it('Permits actions by default', () => {
      expect(a.permitted).to.be.true;
    });

    it('Decides actions are permitted if no components have attempted to permit or deny', () => {
      a.decidePermission();
      expect(a.permitted).to.be.true;
    });

    it('Allows for denial', () => {
      a.deny();
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });

    it('Accepts highest priority permit/deny', () => {
      a.deny({ priority: 0 });
      a.decidePermission();
      expect(a.permitted).to.be.false;
      a.permit({ priority: 1 });
      a.decidePermission();
      expect(a.permitted).to.be.true;
      a.deny({ priority: 1000 });
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });

    it('When permitted and denied with same priority, yields to denial', () => {
      a.permit();
      a.deny();
      a.permit();
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });

  });
});
