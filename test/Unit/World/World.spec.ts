import { expect } from 'chai';
import 'mocha';

import { Entity, Vector, World } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';
import StreamingCheckerboardWorld from '../../Mocks/Worlds/StreamingCheckerboardWorld';

describe('Worlds', () => {
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
      expect(serialized.width).to.equal(world.width);
      expect(serialized.height).to.equal(world.height);
    });

    it('Can deserialize as a a client', () => {
      const clientWorld = World.deserializeAsClient(serialized);
      expect(clientWorld.id).to.equal(world.id);
      expect(clientWorld.name).to.equal("Serialization Test");
      expect(clientWorld.width).to.equal(world.width);
      expect(clientWorld.height).to.equal(world.height);
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
    // TODO also to worlds, different problem..
  });

  describe('Querying for entities', () => {
    let room: Room;
    const Chaos.reset();
    beforeEach(() => {
      room = new Room(100, 100);
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

  describe('Width and height limits', () => {

  });

  describe('Streaming world', () => {
    let world: World;
    beforeEach(() => {
      new EmptyGame({});
      world = new StreamingCheckerboardWorld();
    });

    it('Should be empty initially', () => {
      expect(world.scope.active.size).to.equal(0);
      expect(world.getTile(0, 0)).to.be.undefined;
    });

    it('Should stream in as active entities are added', () => {
      const e = new Entity({ name: "Test Entity" });
      e.active = true;
      e._publish(world, new Vector(0,0));
      expect(world.scope.active.size).to.be.greaterThan(0);
      expect(world.getTile(0, 0)).to.be.not.undefined;
    });

    it('Should unload old tiles as entities move', () => {
      const e = new Entity({ name: "Test Entity" });
      e.active = true;
      e._publish(world, new Vector(0,0));
      e.move({ to: new Vector(400, 400) }).execute();
      expect(world.getTile(0, 0)).to.be.undefined;
    });

    it('Should not unload chunks still being viewed by other entities', () => {
      const e = new Entity({ name: "Test Entity" });
      const other = new Entity({name: "Other Test Entity"});
      e.active = true;
      other.active = true;
      e._publish(world, new Vector(0,0));
      other._publish(world, new Vector(0,0));
      e.move({ to: new Vector(400, 400) }).execute();
      expect(world.scope.active.has(other.position.toChunkSpace().getIndexString())).to.be.true;
      expect(world.getTile(0, 0)).to.not.be.undefined;
    });

    it('Should only persist chunks being viewed by active entities', () => {
      const e = new Entity({ name: "Test Entity", active: true });
      const other = new Entity({ name: "Other Test Entity" });
      e.publish({ world, position: new Vector(0,0) }).execute();
      other.publish({ world, position: new Vector(0,0) }).execute();
      e.move({ to: new Vector(400, 400) }).execute();
      expect(world.scope.active.has(other.position.toChunkSpace().getIndexString())).to.be.false;
      expect(world.getTile(0, 0)).to.be.undefined;
    });

  });
});
