import { expect } from 'chai';
import 'mocha';

import { Component, DisplayComponent } from '../../../src/internal.js';

import { Paladin } from '../../Mocks/Components/Classes';
import { EmptyComponent } from '../../Mocks/Components/Functional';

describe('Component', () => {

  describe('Construction', () => {
    it('Does not overwrite name or tags set by subclasses', () => {
      const c = new Paladin();
      expect(c.name).to.equal('Paladin');
      expect(c.tags).to.contain('class');
    });
  });

  describe('Printing', () => {
    it('Prints its name', () => {
      const e = new EmptyComponent();
      expect(e.print()).to.equal("Unnamed Component");
    });
  });

  describe('Action Function Initialzation', () => {

  });

  describe('Serializing / Deserializing', () => {
    let c: Component;
    let serializedForClient: Component.SerializedForClient;
    beforeEach(() => {
      c = new DisplayComponent({ name: "Serialization Test", tags: ['status', 'debuff'] });
      serializedForClient = c.serializeForClient();
    });

    it('Serializing for clients', () => {
      expect(serializedForClient.id).to.equal(c.id);
      expect(serializedForClient.name).to.equal(c.name);
      expect(serializedForClient.tags).to.contain('status');
      expect(serializedForClient.tags).to.contain('debuff');
    });

    it('Deserializing as a client', () => {
      const deserializedAsClient = Component.DeserializeAsClient(serializedForClient);
      expect(deserializedAsClient.id).to.equal(c.id);
      expect(deserializedAsClient.name).to.equal(c.name);
      expect(deserializedAsClient.tags).to.contain('status');
      expect(deserializedAsClient.tags).to.contain('debuff');
    });
  });

});