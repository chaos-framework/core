import { expect } from 'chai';
import 'mocha';

import { getXYString } from '../../../src/world/World';

describe('Layers', () => {
  describe('Abstract class methods', () => {
    it('Creates a proper key string for chunks based on X&Y', () => {
      expect(getXYString(1,1)).to.equal("1_1");
      expect(getXYString(12345,67890)).to.equal("12345_67890");
    }); 
  });
});