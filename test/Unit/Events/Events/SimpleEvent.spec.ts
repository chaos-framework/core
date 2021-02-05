import { expect } from 'chai';
import 'mocha';

import { Entity, SimpleEvent, Vector } from '../../../../src/internal';


describe('Simple Events', () => {
  let e: Entity;
  beforeEach(() => { e = new Entity({ name: "Test Entity" }) });

  it('Gives out actions no matter if the previous was permitted or not', () => {
    const first = e.move({ to: Vector.zero() });
    const second = e.move({ to: Vector.zero() });
    const third = e.move({ to: Vector.zero() });
    first.deny();
    first.decidePermission();
    const hasActions = new SimpleEvent([ second, third ]);
    expect(hasActions.getNextAction(first)).to.equal(second); // not returning undefined
  });

  it('Returns undefined when given no actions, or when out of new actions to give', () => {
    const empty = new SimpleEvent([]);
    expect(empty.getNextAction()).to.be.undefined;
    const first = e.move({ to: Vector.zero() });
    const second = e.move({ to: Vector.zero() });
    const third = e.move({ to: Vector.zero() });
    const hasActions = new SimpleEvent([ first, second, third ]);
    expect(hasActions.getNextAction()).to.equal(first);
    expect(hasActions.getNextAction()).to.equal(second);
    expect(hasActions.getNextAction()).to.equal(third);
    expect(hasActions.getNextAction()).to.be.undefined;
  });
});