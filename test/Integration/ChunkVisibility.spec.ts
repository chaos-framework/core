import { expect } from 'chai';
import 'mocha';

import { Entity, Chaos, Vector, Player, Team, Viewer, NestedChanges, NestedSetChanges, NestedSet } from '../../src/internal.js';

import Room from '../Mocks/Worlds/Room.js';
import StreamingCheckerboardWorld from '../Mocks/Worlds/StreamingCheckerboardWorld.js';

describe('World and chunk visibility tracking', function() {
  let fixedWorld1: Room;
  let fixedWorld2: Room;
  let streamingWorld: StreamingCheckerboardWorld;
  let entityA1: Entity;
  let entityA2: Entity;
  let entityB1: Entity;
  let inactiveEntity: Entity;
  let playerA1: Player;
  let playerA2: Player;
  let playerB: Player;
  let teamA: Team;
  let teamB: Team;

  this.beforeEach(function () {
    Chaos.setViewDistance(1); // the chunk itself and the ones immediately surrounding it
    fixedWorld1 = new Room(64, 64);
    fixedWorld1.publish();
    fixedWorld2 = new Room(64, 64);
    fixedWorld2.publish();
    streamingWorld = new StreamingCheckerboardWorld();
    streamingWorld.publish();

    teamA = new Team;
    teamA._publish()
    teamB = new Team;
    teamB._publish()

    playerA1 = new Player;
    playerA1._joinTeam(teamA);
    playerA2 = new Player;
    playerA2._joinTeam(teamA);
    playerB = new Player;
    playerB._joinTeam(teamB);

    entityA1 = new Entity({ active: true });
    entityA2 = new Entity({ active: true });
    entityB1 = new Entity({ active: true });
    inactiveEntity = new Entity;

    entityA1._joinTeam(teamA);
    entityA2._joinTeam(teamA);
    entityB1._joinTeam(teamB);
    
    playerA1._ownEntity(entityA1);
    playerA2._ownEntity(entityA2);
    playerB._ownEntity(entityB1);
  });

  describe('Entities and worlds tracking visible chunks', function() {
    describe('Active entities', function() {
      it('Tracks chunks when published to a world', function() {
        // Publish and cache changes
        const action = entityA1.publish({ world: streamingWorld, position: Vector.zero() });
        action.execute();
        const zeroInWorld = streamingWorld.getFullChunkID(0, 0);
        // Test changes
        expect(action.chunkVisibilityChanges!.added['world'][streamingWorld.id].has(zeroInWorld)).to.be.true;
        expect(action.chunkVisibilityChanges!.added['entity'][entityA1.id].has(zeroInWorld)).to.be.true;
        // Make sure changes also applied to nodes themselves
        expect(entityA1.visibleChunks.has(zeroInWorld)).to.be.true;
        expect(teamA.visibleChunks.has(zeroInWorld)).to.be.true;
        expect(playerA1.visibleChunks.has(zeroInWorld)).to.be.true;
        expect(streamingWorld.visibleChunks.has(zeroInWorld)).to.be.true;
      });

      it('Tracks and forgets chunks when moving through a world', function() {
        // Publish
        entityA1.publish({ world: streamingWorld, position: Vector.zero() }).execute();
        // Will not have any changes for moves within the same chunk
        let move = entityA1.move({ to: new Vector(1, 1) });
        move.execute();
        expect(move.chunkVisibilityChanges.hasChanges).to.be.false;
        // Will have changes when moving between chunks
        const action = entityA1.move({ to: new Vector(32, 32) });
        action.execute();
        expect(action.chunkVisibilityChanges?.hasChanges).to.be.true;
        expect(action.chunkVisibilityChanges.added['world'][streamingWorld.id]).to.contain(streamingWorld.getFullChunkID(2, 2));
        expect(action.chunkVisibilityChanges.removed['world'][streamingWorld.id]).to.contain(streamingWorld.getFullChunkID(0, 0));
        expect(action.chunkVisibilityChanges.added['entity'][entityA1.id]).to.contain(streamingWorld.getFullChunkID(2, 2));
        expect(action.chunkVisibilityChanges.removed['entity'][entityA1.id]).to.contain(streamingWorld.getFullChunkID(0, 0));
      });

      it('Forgets chunks when unpublished from a world', function() {
        entityA1.publish({ world: streamingWorld, position: Vector.zero() }).execute();
        const unpublish = entityA1.unpublish();
        unpublish.execute();
        // Test changes
        const zeroInWorld = streamingWorld.getFullChunkID(0, 0);
        expect(unpublish.chunkVisibilityChanges.removed['world'][streamingWorld.id].has(zeroInWorld)).to.be.true;
        expect(unpublish.chunkVisibilityChanges.removed['entity'][entityA1.id].has(zeroInWorld)).to.be.true;
        // Make sure changes also applied to the world node
        // TODO should the changes include the deleted node?
        expect(entityA1.visibleChunks.has(zeroInWorld)).to.be.false;
        expect(streamingWorld.visibleChunks.has(zeroInWorld)).to.be.false;
      });

      it('Updates chunks appropriately after a ChangeWorldAction', function() {
        entityA1.publish({ world: fixedWorld1, position: Vector.zero() }).execute();
        const changeWorlds = entityA1.changeWorlds({ to: streamingWorld, position: Vector.zero() });
        changeWorlds.execute();
        expect(changeWorlds.chunkVisibilityChanges.hasChanges).to.be.true;
        expect(changeWorlds.chunkVisibilityChanges.removed['world'][fixedWorld1.id]).to.include(fixedWorld1.getFullChunkID(0, 0));
        expect(changeWorlds.chunkVisibilityChanges.removed['entity'][entityA1.id]).to.include(fixedWorld1.getFullChunkID(0, 0));
        expect(changeWorlds.chunkVisibilityChanges.added['world'][streamingWorld.id]).to.include(streamingWorld.getFullChunkID(0, 0));
        expect(changeWorlds.chunkVisibilityChanges.added['entity'][entityA1.id]).to.include(streamingWorld.getFullChunkID(0, 0));
      });

      it('Persists chunks after an active entity is unpublished when one active entity is still remaining', function() {
        entityA1._publish(fixedWorld1, Vector.zero());
        entityA2._publish(fixedWorld1, Vector.zero());
        const unpublish = entityA1.unpublish();
        unpublish.execute();
        expect(unpublish.chunkVisibilityChanges.removed['entity'][entityA1.id]).to.contain(fixedWorld1.getFullChunkID(0, 0));
        expect(unpublish.chunkVisibilityChanges.removed['world']).to.not.exist;
      });

      it('Does not track chunks outside the bounds of the world', function() {
        entityA1._publish(fixedWorld1, Vector.zero());
        expect(fixedWorld1.visibleChunks.set).to.not.include(fixedWorld1.getFullChunkID(-1, -1));
      });

      it('Does not keep a world loaded after an entity fails to publish to it', function() {
        entityA1.publish({ world: streamingWorld, position: Vector.zero() }).deniedByDefault().execute();
        expect(inactiveEntity.visibleChunks.set).to.not.contain(fixedWorld1.getFullChunkID(0, 0));
      });
    });

    describe('Inactive entities', function() {
      it('Does not track chunks when published to a world', function() {
        inactiveEntity.publish({ world: fixedWorld1, position: Vector.zero() }).execute();
        expect(inactiveEntity.visibleChunks.set).to.not.contain(fixedWorld1.getFullChunkID(0, 0))
      });

      it('Does not track or forget chunks when moving through a world', function() {
        entityA1.publish({ world: fixedWorld1, position: Vector.zero() }).execute();
        inactiveEntity.publish({ world: fixedWorld1, position: Vector.zero() }).execute();
        inactiveEntity.move({ to: new Vector(32, 32) }).execute();
        expect(inactiveEntity.visibleChunks.set).to.not.contain(fixedWorld1.getFullChunkID(2, 2));
      });

      it('Does not persist chunks when an active entity leaves the world', function() {
        entityA1.publish({ world: streamingWorld, position: Vector.zero() }).execute();
        inactiveEntity.publish({ world: streamingWorld, position: Vector.zero() }).execute();
        entityA1.unpublish().execute();
        expect(streamingWorld.visibleChunks.set).to.not.include(streamingWorld.getFullChunkID(0, 0));
      });

      it('Can be published to a world but is immediately unloaded after', function() {
        inactiveEntity.publish({ world: streamingWorld, position: Vector.zero() }).execute();
        entityA1.unpublish().execute();
        expect(inactiveEntity.visibleChunks.set).to.not.contain(fixedWorld1.getFullChunkID(0, 0));
      });
    });

    describe.skip('Making an inactive published entity active', function() {
    });
  });

  function setupTestsForPerception(grouping: Chaos.PerceptionGrouping, viewerA: Viewer, viewerB: Viewer) {
    describe.skip(`${grouping} perception grouping`, function() {

    });
  }
  // setupTestsForPerception('player', playerA1, playerB);
  // setupTestsForPerception('team', teamA, teamB);

  this.afterEach(function() { Chaos.reset() } );
});