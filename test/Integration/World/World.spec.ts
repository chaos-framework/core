import { expect } from 'chai';
import 'mocha';
import World from '../../../src/World/World';
import BasicLayer from '../../Mocks/Layers/BasicLayer';

describe('World Integration Testing', () => {
  describe('World creation', () => {
    it('Can be created with a simple base layer', () => {
      let w = new World(new BasicLayer());
      expect(w).to.exist;
      expect(w.getTile(0, 0)).to.equal(0);
    });
  });

  describe('World width and height limits', () => {

  });

  // TODO components, or maybe that should be in unit

});