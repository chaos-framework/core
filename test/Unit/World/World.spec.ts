import { expect } from 'chai';
import 'mocha';

import { Chaos, Entity, Vector, World } from '../../../src/internal.js';

import Room from '../../Mocks/Worlds/Room.js';
import StreamingCheckerboardWorld from '../../Mocks/Worlds/StreamingCheckerboardWorld.js';
import Earth from '../../Mocks/Worlds/Earth.js';

describe('Worlds', () => {
  it('Can accurately tell if a passed position is within its bounds', function() {
    const world = new StreamingCheckerboardWorld(new Vector(5, 5));
    expect(world.isInBounds(new Vector(0, 0))).to.be.true;
    expect(world.isInBounds(new Vector(16, 16))).to.be.true;
    expect(world.isInBounds(new Vector(16 * 5 - 1, 16 * 5 - 1))).to.be.true;
    expect(world.isInBounds(new Vector(16 * 5, 16 * 5))).to.be.false;
    expect(world.isInBounds(new Vector(5000, 5000))).to.be.false;
    world.size = new Vector(20, 20);
    expect(world.isInBounds(new Vector(0, 0))).to.be.true;
    expect(world.isInBounds(new Vector(16, 16))).to.be.true;
    expect(world.isInBounds(new Vector(16 * 20 - 1, 16 * 20 - 1))).to.be.true;
    expect(world.isInBounds(new Vector(16 * 20, 20 * 5))).to.be.false;
    expect(world.isInBounds(new Vector(5000, 5000))).to.be.false;
  });

  describe('Serializing / Deserializing', () => {
    let world: World;
    let serialized: World.SerializedForClient;
    beforeEach(() => {
      world = new Room(5, 5);
      world.name = "Serialization Test";
      serialized = world.serializeForClient();
    });

    it('Can serialize for a client', () => {
      expect(serialized.id).to.equal(world.id);
      expect(serialized.name).to.equal("Serialization Test");
      expect(serialized.width).to.equal(world.size.x);
      expect(serialized.height).to.equal(world.size.y);
      // TODO layers
    });

    it('Can deserialize as a a client', () => {
      const clientWorld = World.deserializeAsClient(serialized);
      expect(clientWorld.id).to.equal(world.id);
      expect(clientWorld.name).to.equal("Serialization Test");
      expect(clientWorld.size.x).to.equal(world.size.x);
      expect(clientWorld.size.y).to.equal(world.size.y);
      // TODO layers
    });
  });

  describe('Holding different layers', function() {
    const earth = new Earth();
    earth.addTemporaryViewer(new Vector(0,0), true);
    // const e = new Entity({ name: "Test Entity", active: true });
    // e._publish(earth, new Vector(0, 0));

    it('Should have a baselayer that can be referenced directly and returns numbers', function() {
      expect(earth.baseLayer).to.exist;
      expect(typeof earth.getBaseTile(0, 0)).to.equal('number');
    });

    it('Should have additional layers that can be accessed by name', function() {
      expect(earth.layers.get('atmosphere')).to.exist;
      expect(typeof earth.getTile(0, 0, 'atmosphere')).to.equal('object');
      expect(earth.layers.get('lightLevel')).to.exist;
      expect(typeof earth.getTile(0, 0, 'lightLevel')).to.equal('number');
    });

    it('Should return an object containing the value of all layers when getting a tile', function() {
      const tile = earth.getTile(0,0);
      expect(typeof tile).to.equal('object');
      expect(typeof tile.base).to.equal('number');
      expect(typeof tile.atmosphere).to.equal('object');
      expect(typeof tile.lightLevel).to.equal('number');
    });
  });

  describe('Holding entities', () => {
    let room: Room;
    let e: Entity;
    beforeEach(() => { 
      room = new Room(32, 32);
      e = new Entity({ name: "Test Entity" });
      e._publish(room, new Vector(2, 2));
    });

    it('Holds entities', () => {
      expect(room.entities.size).to.equal(1);
    });

    it("Doesn't hold the same entity twice", () => {
      expect(room.entities.size).to.equal(1);
      expect(room.addEntity(e)).to.be.false;
      expect(room.entities.size).to.equal(1);
    });

    it('Stores entities based on occupied chunks', () => {
      const startingVector = e.position.copy();
      const startingChunk = startingVector.toChunkSpace().getIndexString();
      const endingVector = new Vector(17, 17);
      const endingChunk = endingVector.toChunkSpace().getIndexString();

      // Check for existance in starting chunk
      expect(room.entitiesByChunk.get(startingChunk)).to.exist;
      expect(room.entitiesByChunk.get(startingChunk)!.size).to.equal(1);
      e._move(endingVector);

      // Moving out of it should delete the set from the world but create a new one in the new chunk
      expect(room.entitiesByChunk.get(startingChunk)).to.not.exist;
      expect(room.entitiesByChunk.get(endingChunk)).to.exist;
      expect(room.entitiesByChunk.get(endingChunk)!.size).to.equal(1);

      // Moving back should reverse this
      e._move(startingVector);
      expect(room.entitiesByChunk.get(endingChunk)).to.not.exist;
      expect(room.entitiesByChunk.get(startingChunk)).to.exist;
      expect(room.entitiesByChunk.get(startingChunk)!.size).to.equal(1);

      // Make sure we don't remove a chunk's list of entities if one move out but another is still there
      const newEntity = new Entity({ name: "Test Entity" });
      newEntity._publish(room, new Vector(2, 3));
      expect(room.entitiesByChunk.get(startingChunk)).to.exist;
      expect(room.entitiesByChunk.get(startingChunk)!.size).to.equal(2);
      e._move(endingVector);
      expect(room.entitiesByChunk.get(startingChunk)).to.exist;
      expect(room.entitiesByChunk.get(startingChunk)!.size).to.equal(1);
    });

    // TODO cannot publish same entity twice!
    // TODO also to different worlds, different problem..
  });

  describe('Querying for entities', () => {
    let room: Room;
    Chaos.reset();
    beforeEach(() => {
      room = new Room(100, 100);
      // Place entities 5 tiles apart
      for(let x = 5; x <= 95; x += 5) {
        for(let y = 5; y <= 95; y += 5) {
          const e = new Entity();
          e._publish(room, new Vector(x, y));
        }
      }
    });

    it('Returns entities in a radius correctly', () => {
      expect(room.getEntitiesWithinRadius(new Vector(5,5), 1).length).to.equal(1);
      expect(room.getEntitiesWithinRadius(new Vector(5,5), 5).length).to.equal(3);
      expect(room.getEntitiesWithinRadius(new Vector(10,10), 5).length).to.equal(5);
      expect(room.getEntitiesWithinRadius(new Vector(50,50), 10).length).to.equal(13);
    });
  });
});
