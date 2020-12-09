import { expect } from 'chai';
import 'mocha';
import World from '../../../src/World/World';
import { basicTiles, BasicTiles } from '../../Mocks/Layers/BasicLayer';
import Room from '../../Mocks/Worlds/Room';

describe('World Integration Testing', () => {
  describe('World creation', () => {
    it('Can be created with a simple base layer', () => {
      let w = new Room();
      expect(w).to.exist;
      expect(w.getTile(0, 0)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(0, 3)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(9, 4)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(9, 9)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(2, 2)).to.equal(basicTiles[BasicTiles.Ground]);
      expect(w.getTile(8, 8)).to.equal(basicTiles[BasicTiles.Ground]);
    });
  });

  describe('World width and height limits', () => {

  });

  // TODO components, or maybe that should be in unit

});