import { expect } from 'chai';
import 'mocha';

import Property from '../../../../src/EntityComponent/Properties/Property';
import Value from '../../../../src/EntityComponent/Properties/Value';

describe('Entity Properties', () => {
  it('Defaults to extremely low/high min/max.', () => {
    const p = new Property(new Value(0)); // no min or max specified
    expect(p.current.base).to.equal(0);
    expect(p.min.base).to.equal(-Infinity);
    expect(p.max.base).to.equal(Infinity);
  });
});
