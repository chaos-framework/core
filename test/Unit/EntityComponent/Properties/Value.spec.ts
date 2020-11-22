import { expect } from 'chai';
import 'mocha';
import { AbsoluteModification, AdjustmentModification, MultiplierModification } from '../../../../src/EntityComponent/Properties/Modification';

import Value from '../../../../src/EntityComponent/Properties/Value';

describe('Entity Property Values', () => {
  let v: Value;
  beforeEach(() => {
    v = new Value(100);
  });

  it('Calculates the base value on initialization', () => {
    expect(v.calculated).to.equal(100);
  });

  it('Can set the base value directly and calculates immediately', () => {
    v.set(1000);
    expect(v.base).to.equal(1000);
    expect(v.calculated).to.equal(1000);
  });

  it('Can adjust the base value directly and calculates immediately', () => {
    v.adjust(100);
    expect(v.base).to.equal(200);
    expect(v.calculated).to.equal(200);
  });

  it('Properly calculates values with adjustments and multiplication modifications.', () => {
    v.apply(new AdjustmentModification(25));
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(125);
    v.apply(new MultiplierModification(2));
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(250);
  });

  it('Lets the first absolute value override any others.', () => {
    v.apply(new AdjustmentModification(25));
    v.apply(new MultiplierModification(2));
    v.apply(new AbsoluteModification(0)); // the one we expect to use
    v.apply(new AbsoluteModification(123)); // ignored, for now
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(0);
  });
  
  it('Removes different types of modifications and recalculates correctly', () => {
    const adjustment = new AdjustmentModification(25);
    const multiplier = new MultiplierModification(2);
    const firstAbsolute = new AbsoluteModification(0);
    const secondAbsolute = new AbsoluteModification(123);
    v.apply(adjustment);
    v.apply(multiplier);
    v.apply(firstAbsolute);
    v.apply(secondAbsolute);
    v.remove(firstAbsolute);
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(123);
    v.remove(secondAbsolute);
    expect(v.calculated).to.equal(250); // (100 base + 25 adjustment ) * 2 multiplier
    v.remove(adjustment);
    expect(v.calculated).to.equal(200); // 100 base * 2 multiplier
    v.remove(multiplier);
    expect(v.calculated).to.equal(100); // 100 base
  });

});
