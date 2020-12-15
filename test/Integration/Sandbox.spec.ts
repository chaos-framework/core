import { expect } from 'chai';
import 'mocha';

import { createPaladin, createZombie } from '../Mocks/Entities/Actors';

describe('Metarogue Sandbox', function() {
  it('Sandbox', function() {
    if(!process.env.METAROGUE_SANDBOX) {
      this.skip();
    }
    const pali = createPaladin();
    const zombie = createZombie();
    const spell = pali.cast("Heal", { target: zombie });
    spell?.execute();
  })
});