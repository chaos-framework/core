import { expect } from 'chai';
import 'mocha';

import { Action } from '../../../src/internal';

// Fake concrete implementation
class TestAction extends Action {
  apply(): boolean {
    return true;
  }
}

describe('Action Abstract Functionality', () => {

  describe('Permits or forbids actions intelligently', () => {
    let a: TestAction;
    beforeEach(() => { a = new TestAction() });

    it('Permits actions by default', () => {
      expect(a.permitted).to.be.true;
    });

    it('Permits items if calculated when nothing else permits or denies', () => {
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

    it('Defers to denials on the same level as previously set and new permits', () => {
      a.permit();
      a.deny();
      a.permit();
      a.decidePermission();
      expect(a.permitted).to.be.false;
    });

  });
});