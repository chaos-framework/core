import { expect } from 'chai';
import 'mocha';

import { basicTiles, BasicTiles } from '../../Mocks/Layers/BasicLayer';
import Room from '../../Mocks/Worlds/Room';

describe('World Integration Testing', () => {
  describe('World creation', () => {
    it('Can be created with a simple base layer', () => {
      let w = new Room(5, 5);
      expect(w).to.exist;
      expect(w.getTile(0, 0)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(0, 2)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(4, 4)).to.equal(basicTiles[BasicTiles.Wall]);
      expect(w.getTile(1, 2)).to.equal(basicTiles[BasicTiles.Ground]);
      expect(w.getTile(3, 3)).to.equal(basicTiles[BasicTiles.Ground]);
    });
  });

  // TODO components, or maybe that should be in unit

});
