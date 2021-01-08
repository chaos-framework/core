import { expect } from 'chai';
import 'mocha';
import Entity from '../../../src/EntityComponent/Entity';
import Vector from '../../../src/Math/Vector';
import World, { getXYString } from '../../../src/World/World';

import Room from '../../Mocks/Worlds/Room';
import StreamingCheckerboardWorld from '../../Mocks/Worlds/StreamingCheckerboardWorld';

describe('Worlds', () => {
  describe('Holding entities', () => {
    let room: Room;
    let e: Entity;
    beforeEach(() => { 
      room = new Room(32, 32);
      e = new Entity();
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
      const newEntity = new Entity;
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

  describe('Width and height limits', () => {

  });

  describe('Streaming world', () => {
    let world: World;
    beforeEach(() => {
      world = new StreamingCheckerboardWorld();
    });

    it('Should be empty initially', () => {
      expect(world.scope.active.size).to.equal(0);
    })
  });
});