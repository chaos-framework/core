import { expect } from 'chai';
import 'mocha';

import { ComponentCatalog, Entity, Component, ComponentContainer, Chaos } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';

describe('ComponentCatalog', () => {
  let entity: Entity;
  let world: Room;
  beforeEach(() => {
    Chaos.reset();
    entity = new Entity();
    world = new Room();
  });

  describe('Construction', () => {
    it('Can take any type of ComponentContainer as a parent and assume the correct scope', () => {
      const attachedToEntity = new ComponentCatalog(entity);
      expect(attachedToEntity.parentScope).to.equal('entity');
      const attachedToWorld = new ComponentCatalog(world);
      expect(attachedToWorld.parentScope).to.equal('world');
      const attachedToGame = new ComponentCatalog(Chaos.reference);
      expect(attachedToGame.parentScope).to.equal('game');
    });
  });

});
