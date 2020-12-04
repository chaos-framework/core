import { expect } from 'chai';
import 'mocha';

import Layer from '../../../src/World/Layer';
import { ShortChunk } from '../../../src/World/Types';

describe('Layers', () => {
  describe('Abstract class methods', () => {
    it('Creates a proper key string for chunks based on X&Y', () => {
      expect(Layer.getXYString(1,1)).to.equal("1_1");
      expect(Layer.getXYString(12345,67890)).to.equal("12345_67890");
    }); 
  });
});

describe('Chunks', () => {
  describe('Short Chunk', () => {
    let c: ShortChunk;
    beforeEach(() => { c = new ShortChunk(0); });

    it('Fills itself with specified fill number', () => {
      expect(c.getTile(0,0)).to.eq(0);
      expect(c.getTile(5,5)).to.eq(0);
      let other = new ShortChunk(5);
      expect(other.getTile(0,0)).to.eq(5);
      expect(other.getTile(5,5)).to.eq(5);
    }); 

    it('Clamps values when set', () => {
      c.setTile(0,0,-50);
      expect(c.getTile(0,0)).to.eq(0);
      c.setTile(0,0,12345);
      expect(c.getTile(0,0)).to.eq(255);
    });
  });
});