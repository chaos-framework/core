import { expect } from 'chai';
import 'mocha';

import Layer from '../../../src/World/Layer';

describe('World Layer Abstract Class', () => {
  it('Creates a proper key string for chunks based on X&Y', () => {
    expect(Layer.getXYString(1,1)).to.equal("1_1");
    expect(Layer.getXYString(12345,67890)).to.equal("12345_67890");
  }); 
});
