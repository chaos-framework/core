import { expect } from 'chai';
import 'mocha';

import Entity from '../../src/EntityComponent/Entity';

import EmptyAbility from '../Mocks/Abilities/Empty';

describe('Entity', () => {
  
});

describe('Entity action generators', () => {

});

describe('Entity action direct methods', () => {
  let e: Entity;
  beforeEach(() => { e = new Entity(); });

  describe('Granting abilities', () => {
    const ability = new EmptyAbility();
    it('Can be granted a single ability.', () => {
      // Granting single ability
      expect(e.abilities.size).to.equal(0);
      e._grant(ability, undefined, undefined);
      expect(e.abilities.size).to.equal(1);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(1);
      }
    });
    
    it('Cannot be granted duplicate abilities.', () => {
      expect(e.abilities.size).to.equal(0);
      // Attempt to grant the same ability the same way multiple times
      e._grant(ability, undefined, undefined);
      e._grant(ability, undefined, undefined);
      e._grant(ability, undefined, undefined);
      e._grant(ability, undefined, undefined);
      expect(e.abilities.size).to.equal(1);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(1);
      }
    });
    
    it('Can be granted the same ability using different entities or components.', () => {
      expect(e.abilities.size).to.equal(0);
      const someOtherEntity = new Entity();
      e._grant(ability, undefined, undefined);
      e._grant(ability, someOtherEntity, someOtherEntity);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(2);
      }
    });

  });

  describe('Denying (removing) abilities', () => {
    const ability = new EmptyAbility();
    const someOtherEntity = new Entity();

    // Give the entity some abilities to deny for every test
    beforeEach(() => { 
      e = new Entity(); 
      e._grant(ability, undefined, undefined);
      e._grant(ability, someOtherEntity, someOtherEntity);
    });

    it('Can deny an ability using or granted by one source.', () => {
      // Remove one 
      e._deny(ability, undefined, undefined);
      expect(e.abilities.size).to.equal(1);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(1);
      }
    });

    it('Can deny an entire ability by denying both sources.', () => {
      // Remove one 
      e._deny(ability, undefined, undefined);
      e._deny(ability, someOtherEntity, someOtherEntity);
      expect(e.abilities.size).to.equal(0);
      // Check both methods for seeing if an entity has an ability
      const grant = e.abilities.get(ability.name);
      expect(grant).to.not.exist;
      expect(e.can(ability.name)).to.be.false;
    });
  });

  describe('Equipping items', () => {
    
  });
});
