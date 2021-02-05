import { expect } from 'chai';
import 'mocha';

import { Entity, Property, PropertyChangeAction } from '../../../src/internal';

describe('PropertyChange Action', () => {
  let e: Entity;
  beforeEach(() => {
    e = new Entity({ name: "Test Entity" });
  });

  it('Calculates adjustments (add/subtract) correctly.', () => {
    const a = new PropertyChangeAction({caster: e, target: e, property: 'HP', amount: 100});
    a.adjust(10);   // 100 + 10
    a.adjust(-10);  // 100 + 0
    a.adjust(30);   // 100 + 30
    expect(a.calculate()).to.equal(130);
  });

  it('Calculates multipliers (multiply/divide) correctly.', () => {
    const a = new PropertyChangeAction({caster: e, target: e, property: 'HP', amount: 100});
    a.multiply(10);   // 100 * 10
    a.multiply(0.5);  // 100 * 10 / 2
    expect(a.calculate()).to.equal(500);
  });

  it('Maintains the right order of operations for adjustments and multipliers.', () => {
    const a = new PropertyChangeAction({caster: e, target: e, property: 'HP', amount: 100});
    a.multiply(10);   // 100 * 10
    a.adjust(100);    // (100 + 100) * 10
    a.multiply(2);    // (100 + 100) * 10 * 2 = 4000
    expect(a.calculate()).to.equal(4000);
  });

});

describe('PropertyModification Action', () => {
  let e: Entity;
  beforeEach(() => {
    e = new Entity({ name: "Test Entity" });
  });

  

});