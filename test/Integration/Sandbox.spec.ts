import { expect } from 'chai';
import 'mocha';

import { createPaladin, createZombie } from '../Mocks/Entities/Actors';

describe('metaroguesandbox', () => {
  it('Runs!', () => {
    const pali = createPaladin();
    const zombie = createZombie();
    const spell = pali.cast("Heal", { target: zombie });
    spell?.execute();
  })
});