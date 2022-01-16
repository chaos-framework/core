import { expect } from 'chai';
import 'mocha';

import { Entity, Chaos, Vector, Player, Team, Viewer, NestedChanges, NestedSetChanges, NestedSet } from '../../src/internal.js';

import Earth from '../Mocks/Worlds/Earth.js';
import { earthAtmosphere } from '../Mocks/Layers/Atmosphere.js';

describe.only('Serialzing world data', function () {
  let earth: Earth;
  let activeEntity: Entity;
  beforeEach(function() {
    earth = new Earth();
    activeEntity = new Entity({ active: true });
    activeEntity.publish({ world: earth, position: new Vector(0, 0) }).execute();
  })

  it('Should serialize data for individual chunks correctly', function () {
    const data = earth.serializeChunk(0, 0);
    // We should see a baseLayer, atmosphere, and lightLevel
    expect(data.base?.[0]).to.equal(0);
    expect(data.lightLevel?.[0]).to.equal(1);
    expect(data.atmosphere?.[0]).to.equal(earthAtmosphere);
  })
});