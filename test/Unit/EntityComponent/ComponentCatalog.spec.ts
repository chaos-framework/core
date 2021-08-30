import { expect } from 'chai';
import 'mocha';

import { ComponentCatalog, Entity, Chaos } from '../../../src/internal';
import { EmptyComponent } from '../../Mocks/Components/Functional';

import Room from '../../Mocks/Worlds/Room';

describe('ComponentCatalog', () => {

  describe('Construction', () => {
    it('Can take any type of ComponentContainer as a parent and assume the correct scope', () => {
      const entity = new Entity();
      const world = new Room();
      const attachedToEntity = new ComponentCatalog(entity);
      expect(attachedToEntity.parentScope).to.equal('entity');
      const attachedToWorld = new ComponentCatalog(world);
      expect(attachedToWorld.parentScope).to.equal('world');
      const attachedToGame = new ComponentCatalog(Chaos.reference);
      expect(attachedToGame.parentScope).to.equal('game');
    });
  });

  describe('Storing and retrieving components by name', () => {
    const entity = new Entity();
    const red = new EmptyComponent({ name: 'Red' });
    const blue1 = new EmptyComponent({ name: 'Blue' });
    const blue2 = new EmptyComponent({ name: 'Blue' });

    it('Stores and retrieves components by name', () => {
      const catalog = new ComponentCatalog(entity);
      expect(catalog.get('Red')).to.not.exist;
      catalog.addComponent(red);
      expect(catalog.get('Red')).to.exist;
      catalog.removeComponent(red);
      expect(catalog.get('Red')).to.not.exist;
      catalog.addComponent(blue1);
      catalog.addComponent(blue2);
      expect(catalog.get('Blue')).to.equal(blue1);
      expect(catalog.getAll('Blue')?.length).to.equal(2);
      catalog.removeComponent(blue1);
      expect(catalog.get('Blue')).to.equal(blue2);
      expect(catalog.getAll('Blue')?.length).to.equal(1);
    });
  });

});
