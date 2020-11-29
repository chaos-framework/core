import { expect } from 'chai';
import 'mocha';
import Entity from '../../../../src/EntityComponent/Entity';
import { AbsoluteModification, AdjustmentModification, MultiplierModification } from '../../../../src/EntityComponent/Properties/Modification';
import Property from '../../../../src/EntityComponent/Properties/Property';

import Value from '../../../../src/EntityComponent/Properties/Value';
import { PropertyChangeAction } from '../../../../src/Events/Actions/PropertyActions';

describe('Entity Property Values', () => {
  let e: Entity;
  let p: Property;
  let v: Value;
  beforeEach(() => {
    // Create entity and property just to give the value a parent -- does not affect value logic
    e = new Entity();
    p = new Property(e, "HP");
    // ValueType is irrelevant
    v = new Value(p, 'current', 100);
  });

  it('Calculates the base value on initialization', () => {
    expect(v.calculated).to.equal(100);
  });

  it('Can set the base value directly and calculates immediately', () => {
    v._set(1000);
    expect(v.base).to.equal(1000);
    expect(v.calculated).to.equal(1000);
  });

  it('Can adjust the base value directly and calculates immediately', () => {
    v._adjust(100);
    expect(v.base).to.equal(200);
    expect(v.calculated).to.equal(200);
  });

  it('Properly calculates values with adjustments and multiplication modifications.', () => {
    v._apply(new AdjustmentModification(25));
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(125);
    v._apply(new MultiplierModification(2));
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(250);
  });

  it('Lets the first absolute value override any others.', () => {
    v._apply(new AdjustmentModification(25));
    v._apply(new MultiplierModification(2));
    v._apply(new AbsoluteModification(0)); // the one we expect to use
    v._apply(new AbsoluteModification(123)); // ignored, for now
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(0);
  });
  
  it('Removes different types of modifications and recalculates correctly', () => {
    const adjustment = new AdjustmentModification(25);
    const multiplier = new MultiplierModification(2);
    const firstAbsolute = new AbsoluteModification(0);
    const secondAbsolute = new AbsoluteModification(123);
    v._apply(adjustment);
    v._apply(multiplier);
    v._apply(firstAbsolute);
    v._apply(secondAbsolute);
    v._remove(firstAbsolute);
    expect(v.base).to.equal(100);
    expect(v.calculated).to.equal(123);
    v._remove(secondAbsolute);
    expect(v.calculated).to.equal(250); // (100 base + 25 adjustment ) * 2 multiplier
    v._remove(adjustment);
    expect(v.calculated).to.equal(200); // 100 base * 2 multiplier
    v._remove(multiplier);
    expect(v.calculated).to.equal(100); // 100 base
  });

  it('Can generate set actions', () => {
    const a: PropertyChangeAction = v.set({ amount: 12345 });
    // Target should be parent/property entity
    expect(a.target).to.equal(e);
    // Property should be parent property
    expect(a.property).to.equal('HP');
    // Should be "Current" value by default
    expect(a.value).to.equal('current')
    // Should be "Set" method by default
    expect(a.type).to.equal('set');
    // Other values
    expect(a.amount).to.equal(12345);
  });

  it('Can generate adjustment actions', () => {
    const a: PropertyChangeAction = v.adjust({ amount: 12345 });
    // Target should be parent/property entity
    expect(a.target).to.equal(e);
    // Property should be parent property
    expect(a.property).to.equal('HP');
    // Should be "Current" value by default
    expect(a.value).to.equal('current')
    // Should be "Set" method by default
    expect(a.type).to.equal('adjust');
    // Other values
    expect(a.amount).to.equal(12345);
  });

});
