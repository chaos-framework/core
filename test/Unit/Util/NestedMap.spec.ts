import { expect } from 'chai';
import 'mocha';

import { NestedMap, NestedChanges } from '../../../src/internal';

describe.only('NestedMap', () => {
  describe('Without nesting', () => {
    let unnested: NestedMap<number>;
    beforeEach(() => {
      unnested = new NestedMap<number>('solo', 'level is irrelevent');
    })

    it('Can add individual entries.', () => {
      unnested.add('1', 1);
      unnested.add('2', 2);
      unnested.add('3', 3);
      unnested.add('3', 3); // redundant test
      unnested.add('test', 4);
      unnested.add('test', 5); // overwrite test
      expect(unnested.get('1')).to.equal(1);
      expect(unnested.get('2')).to.equal(2);
      expect(unnested.get('3')).to.equal(3);
      expect(unnested.get('test')).to.equal(5);
    });

    it('Can remove individual entries.', () => {
      unnested.add('1', 1);
      unnested.add('2', 2);
      unnested.remove('1');
      expect(unnested.get('1')).to.be.undefined;
      expect(unnested.get('2')).to.equal(2);
    });

    it('Tracks changes for individual additions.', () => {
      unnested.add('1', 1);
    });

    it('Tracks changes for individual subtractions.', () => {
      unnested.add('1', 1);
    });
  });

  describe('With nesting', () => {

  });
});
