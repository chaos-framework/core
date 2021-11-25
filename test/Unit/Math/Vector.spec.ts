import { expect } from 'chai';
import 'mocha';

import { Vector } from '../../../src/internal.js';

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

  it('Finds dot products correctly', () => {
    const a = new Vector(1, 0);
    expect(a.dot(new Vector(1, 0))).to.equal(1);
    expect(a.dot(new Vector(0, 1))).to.equal(0);
    expect(a.dot(new Vector(-1, 0))).to.equal(-1);
    // expect(a.dot(new Vector(1, 1))).to.equal(0.707);
  });

  it('Can return points between points', function() {
    const a = new Vector(1,1);
    const b = new Vector(5,5);
    const pointsBetween = a.getLineTo(b);
    expect(pointsBetween[0].equals(new Vector(1,1))).to.be.true;
    expect(pointsBetween[1].equals(new Vector(2,2))).to.be.true;
    expect(pointsBetween[2].equals(new Vector(3,3))).to.be.true;
    expect(pointsBetween[3].equals(new Vector(4,4))).to.be.true;
    expect(pointsBetween[4].equals(new Vector(5,5))).to.be.true;
  })
});