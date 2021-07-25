import { expect } from 'chai';
import 'mocha';

import { Entity, Ability, Component, Sensor } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';
import EmptyAbility from '../../Mocks/Abilities/Empty';
import { Heal }  from '../../Mocks/Abilities/Spells';
import { Paladin } from '../../Mocks/Components/Classes';
import { NonBroadcastingComponent } from '../../Mocks/Components/NonBroadcastingComponent';
import { Eyes } from '../../Mocks/Components/Sensors';

describe('Entity', () => {

  describe('Printing', () => {
    it('Prints its name', () => {
      const e = new Entity({name: "Test"});
      expect(e.print()).to.equal("Test");
    });
  });

  describe('Serializing / Deserializing', () => {
    let e: Entity;
    let serializedForClient: Entity.SerializedForClient;
    let paladin: Component;
    beforeEach(() => {
      e = new Entity({ name: "CS Test", active: true, omnipotent: false });
      paladin = new Paladin()
      e._attach(paladin);
      e._attach(new NonBroadcastingComponent());  // this should not get serialized for any client
      serializedForClient = e.serializeForClient();
    });

    it('Serializing for clients', () => {
      expect(serializedForClient.id).to.equal(e.id);
      expect(serializedForClient.active).to.be.true;
    });

    it('Deserializing as a client', () => {
      const deserializedAsClient = Entity.DeserializeAsClient(serializedForClient);
      expect(deserializedAsClient.id).to.equal(e.id);
      expect(deserializedAsClient.active).to.be.true;
    });

    it('Includes components, public only, when serializing for clients', () => {
      expect(serializedForClient.components).to.exist;
      if(serializedForClient.components !== undefined) {
        expect(serializedForClient.components.length).to.equal(1);
        expect(serializedForClient.components[0].name).to.equal('Paladin');
        expect(serializedForClient.components[0].id).to.equal(paladin.id);
      }
    });
  })

  describe('Tracking sensors', () => {
    let e: Entity;
    let sensor: Component & Sensor;
    beforeEach(() => {
      e = new Entity({ name: "CS Test", active: true, omnipotent: false });
      sensor = new Eyes();
    });

    it('Tracks which sensors are added to an entity, and adds as children of sensedEntities NestedMap', () => {
      e._attach(sensor);
      expect(e.sensedEntities.children.has(sensor.id));
    });
  });

});

describe('Entity action/event generators', () => {
  let e: Entity;
  let heal: Ability;
  beforeEach(() => { 
    e = new Entity({ name: "Unit Test Entity" });
    e._addProperty("HP");
    heal = new Heal();
    e._learn(heal, e, e);
  });

  describe('Casting', () => {
    it('Generates an event for an ability it does have', () => {
      expect(e.cast(heal.name, { target: e, using: e.id })).to.exist;
    });
    
    it('Does not generate and event for an ability it does not have', () => {
      expect(e.cast("blah")).to.be.undefined;
    });
  });
});

describe('Entity action direct methods', () => {
  let e: Entity;
  beforeEach(() => { e = new Entity({ name: "Unit Test Entity" }); });

  describe('Publishing', () => {
    let room: Room;
    beforeEach(() => {
      room = new Room(12, 12);
    });

    it('Can publish itself to a world', () => {
      expect(e._publish(room, room.stageLeft)).to.be.true;
      expect(e.world).to.equal(room);
    });
    
    it('Can cannot be published twice', () => {
      e._publish(room, room.stageLeft);
      expect(e._publish(room, room.stageLeft)).to.be.false;
    });
  })

  describe('Adding properties', () => {
    it('Can add a property', () => {
      expect(e._addProperty("Test")).to.be.true;
    });
    
    it('Cannot add the same named property twice', () => {
      e._addProperty("Test");
      expect(e._addProperty("Test")).to.be.false;
    });
    
  });

  describe('Removing properties', () => {
    beforeEach(() => { e._addProperty("Test") });
    it('Can remove a property', () => {
      expect(e._removeProperty("Test")).to.be.true;
    });
    
    it('Cannot remove a non-existant property', () => {
      expect(e._removeProperty("Something That Certainly Doesn't Exist")).to.be.false;
    });
  });

  describe('Granting abilities', () => {
    const ability = new EmptyAbility();
    it('Can be granted a single ability', () => {
      // Granting single ability
      expect(e.abilities.size).to.equal(0);
      expect(e._learn(ability, undefined, undefined)).to.be.true;
      expect(e.abilities.size).to.equal(1);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(1);
      }
    });
    
    it('Cannot be granted duplicate abilities', () => {
      expect(e.abilities.size).to.equal(0);
      // Attempt to grant the same ability the same way multiple times
      expect(e._learn(ability, undefined, undefined)).to.be.true;
      expect(e._learn(ability, undefined, undefined)).to.be.false;
      expect(e._learn(ability, undefined, undefined)).to.be.false;
      expect(e._learn(ability, undefined, undefined)).to.be.false;
      expect(e.abilities.size).to.equal(1);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(1);
      }
    });
    
    it('Can be granted the same ability using different entities or components', () => {
      expect(e.abilities.size).to.equal(0);
      const someOtherEntity = new Entity({ name: "Unit Test Entity" });
      expect(e._learn(ability, undefined, undefined)).to.be.true;
      expect(e._learn(ability, someOtherEntity, someOtherEntity)).to.be.true;
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(2);
      }
    });

  });

  describe('Denying (removing) abilities', () => {
    let ability: Ability;
    let someOtherEntity: Entity;

    // Give the entity some abilities to deny for every test
    beforeEach(() => { 
      ability = new EmptyAbility();
      someOtherEntity = new Entity({ name: "Unit Test Entity" });
      e._learn(ability, undefined, undefined);
      e._learn(ability, someOtherEntity, someOtherEntity);
    });

    it('Can deny an ability using or granted by one source', () => {
      // Remove one 
      expect(e._forget(ability, undefined, undefined)).to.be.true;
      expect(e.abilities.size).to.equal(1);
      const grant = e.abilities.get(ability.name);
      expect(grant).to.exist;
      if(grant) { // typescript compile safety
        expect(grant.length).to.equal(1);
      }
    });

    it('Can deny an entire ability by denying both sources', () => {
      // Remove one 
      expect(e._forget(ability, undefined, undefined)).to.be.true;
      expect(e._forget(ability, someOtherEntity, someOtherEntity)).to.be.true;
      expect(e.abilities.size).to.equal(0);
      // Check both methods for seeing if an entity has an ability
      const grant = e.abilities.get(ability.name);
      expect(grant).to.not.exist;
      expect(e.can(ability.name)).to.be.false;
    });
  });

  describe('Adding slots', () => {
    const slotName = "Head";
    const slots = ["Head", "Chest", "Hands", "Legs", "Feet"];

    it('Grants a single slot', () => {
      expect(e.slots.size).to.equal(0);
      expect(e._addSlot(slotName)).to.be.true;
      expect(e.slots.size).to.equal(1);
      expect(e.slots.has(slotName)).to.be.true;
    });

    it('Fails to grant an existing slot', () => {
      expect(e.slots.size).to.equal(0);
      expect(e._addSlot(slotName)).to.be.true;
      expect(e._addSlot(slotName)).to.be.false;
      expect(e.slots.size).to.equal(1);
    });

    it('Can grant multiple slots', () => {
      expect(e.slots.size).to.equal(0);
      slots.map(slot => {
        expect(e._addSlot(slot)).to.be.true;
      });
      expect(e.slots.size).to.equal(slots.length);
    });
  });

  describe('Removing slots', () => {
    const slotName = "Head";
    const slots = ["Head", "Chest", "Hands", "Legs", "Feet"];

    // Grant some default slots
    beforeEach(() => {
      slots.map(slot => {
        e._addSlot(slot);
      });
    });

    it('Can remove a single slot', () => {
      expect(e._removeSlot(slotName)).to.be.true;
      expect(e.slots.has(slotName)).to.be.false;
      expect(e.slots.size).to.equal(slots.length - 1);
    });

    it('Cannot remove a nonexistant slot', () => {
      expect(e._removeSlot("randomstringakldfjklsjflksjf")).to.be.false;
    });
  });

  describe('Equipping items', () => {
    const mainSlot = "Head";
    const slots = ["Head", "Chest", "Hands", "Legs", "Feet"];
    let item: Entity;

    beforeEach(() => {
      item = new Entity({ name: "Unit Test Entity" });
      slots.map(slot => {
        e._addSlot(slot);
      });
    });

    it('Can equip an item', () => {
      expect(e.slots.get(mainSlot)).to.be.undefined;
      expect(e._equip(item, mainSlot)).to.be.true;
      expect(e.slots.get(mainSlot)).to.be.equal(item);
    });

    it('Cannot equip an item into an occupied slot', () => {
      e._equip(item, mainSlot);
      expect(e._equip(item, mainSlot)).to.be.false;
    });
  });

  describe('Moving', () => {
    // Give the entity a space to move in
    let room: Room;
    beforeEach(() => {
      room = new Room(9, 9);
      e._publish(room, room.stageLeft);
    });

    it('Can move within in a World', () => {
      expect(e.position.x).to.equal(room.stageLeft.x);
      expect(e.position.y).to.equal(room.stageLeft.y);
      e._move(room.stageRight);
      expect(e.position.equals(room.stageRight)).to.be.true;
    });
  });
});
