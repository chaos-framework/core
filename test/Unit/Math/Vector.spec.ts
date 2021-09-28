import { expect } from 'chai';
import 'mocha';

import { Vector } from '../../../src/internal';

describe('Vector', () => {
  it('Can check if another vector is within range', () => {
    const origin = new Vector(0, 0);
    expect(origin.withinRadius(new Vector(0,0), 1)).to.be.true;
    expect(origin.withinRadius(new Vector(1,1), 1)).to.be.false;  // because it's a circle, a one-range check is basically a plus sign
    expect(origin.withinRadius(new Vector(0,1), 1)).to.be.true;
    expect(origin.withinRadius(new Vector(2,2), 1)).to.be.false;
    expect(origin.withinRadius(new Vector(1,1), 2)).to.be.true;
    expect(origin.withinRadius(new Vector(0,5), 5)).to.be.true;
    expect(origin.withinRadius(new Vector(5,0), 10)).to.be.true;
    expect(origin.withinRadius(new Vector(0,5), 4)).to.be.false;
  });

  it.only('Finds dot products correctly', () => {
    const a = new Vector(1, 0);
    expect(a.dot(new Vector(1, 0))).to.equal(1);
    expect(a.dot(new Vector(0, 1))).to.equal(0);
    expect(a.dot(new Vector(-1, 0))).to.equal(-1);
    // expect(a.dot(new Vector(1, 1))).to.equal(0.707);
  });
});