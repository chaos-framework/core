import { expect } from 'chai';
import 'mocha';
import Entity from '../../../../src/EntityComponent/Entity';

import Property from '../../../../src/EntityComponent/Properties/Property';
import Value from '../../../../src/EntityComponent/Properties/Value';

describe('Entity Properties', () => {
  let e: Entity;

  beforeEach(() => {
    e = new Entity();
  });
  
  it('Defaults to extremely low/high min/max.', () => {
    const p = new Property(e, "test", 0); // no min or max specified
    expect(p.current.base).to.equal(0);
    expect(p.min.base).to.equal(-Infinity);
    expect(p.max.base).to.equal(Infinity);
  });
});
