import { expect } from 'chai';
import 'mocha';

import { Entity, Chaos, Vector, Player, Team, Viewer, NestedChanges, NestedSetChanges, NestedSet } from '../../src/internal.js';

import Room from '../Mocks/Worlds/Room.js';
import StreamingCheckerboardWorld from '../Mocks/Worlds/StreamingCheckerboardWorld.js';

describe.only('World and chunk visibility tracking and loading', function() {
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
  });

  describe('Entities and worlds tracking visible chunks', function() {
    describe('Active entities', function() {
      it('Tracks chunks when published to a world', function() {
        // Publish and cache changes
        const changes = entityA1._publish(fixedWorld1, Vector.zero())! as NestedSetChanges;
        const zeroInWorld = fixedWorld1.getFullChunkID(0, 0);
        // Test changes
        expect(changes.added['world'][fixedWorld1.id].has(zeroInWorld)).to.be.true;
        expect(changes.added['entity'][entityA1.id].has(zeroInWorld)).to.be.true;
        // Make sure changes also applied to nodes themselves
        expect(entityA1.visibleChunks.has(zeroInWorld)).to.be.true;
        expect(fixedWorld1.visibleChunks.has(zeroInWorld)).to.be.true;
      });

      it('Tracks and forgets chunks when moving through a world', function() {
          // Publish
          entityA1._publish(fixedWorld1, Vector.zero());
          // Will not have any changes for moves within the same chunk
          const noChanges = entityA1._move(new Vector(1, 1)) as NestedSetChanges;
          expect(noChanges).to.be.undefined;
          // Will have changes when moving between chunks
          const changes = entityA1._move(new Vector(32, 32)) as NestedSetChanges;
          expect(changes?.hasChanges).to.be.true;
          expect(changes.added['world'][fixedWorld1.id]).to.contain(fixedWorld1.getFullChunkID(2, 2));
          expect(changes.removed['world'][fixedWorld1.id]).to.contain(fixedWorld1.getFullChunkID(0, 0));
          expect(changes.added['entity'][entityA1.id]).to.contain(fixedWorld1.getFullChunkID(2, 2));
          expect(changes.removed['entity'][entityA1.id]).to.contain(fixedWorld1.getFullChunkID(0, 0));
      });

      it('Forgets chunks when unpublished from a world', function() {
        entityA1._publish(fixedWorld1, Vector.zero());
        const changes = entityA1._unpublish() as NestedSetChanges;
        const zeroInWorld = fixedWorld1.getFullChunkID(0, 0);
        // Test changes
        expect(changes.removed['world'][fixedWorld1.id].has(zeroInWorld)).to.be.true;
        expect(changes.removed['entity'][entityA1.id].has(zeroInWorld)).to.be.true;
        // Make sure changes also applied to the world node
        // TODO should the changes include the deleted node?
        expect(entityA1.visibleChunks.has(zeroInWorld)).to.be.false;
        expect(fixedWorld1.visibleChunks.has(zeroInWorld)).to.be.false;
      });

      it('Updates chunks appropriately after a ChangeWorldAction', function() {
        entityA1._publish(fixedWorld1, Vector.zero());
        const changes = entityA1._changeWorlds(fixedWorld2, Vector.zero()) as NestedSetChanges;
        expect(changes).to.not.be.false;
        expect(changes.removed['world'][fixedWorld1.id]).to.include(fixedWorld1.getFullChunkID(0, 0));
        expect(changes.removed['entity'][entityA1.id]).to.include(fixedWorld1.getFullChunkID(0, 0));
        expect(changes.added['world'][fixedWorld2.id]).to.include(fixedWorld2.getFullChunkID(0, 0));
        expect(changes.added['entity'][entityA1.id]).to.include(fixedWorld2.getFullChunkID(0, 0));
      });

      it.skip('Persists chunks after an active entity is unpublished when one active entity is still remaining', function() {
      });

      it.skip('Does not track chunks outside the bounds of the world', function() {
      });
    });

    describe.skip('Inactive entities', function() {

      it.skip('Does not track chunks when published to a world', function() {
      });

      it.skip('Does not track or forget chunks when moving through a world', function() {
      });

      it.skip('Does not persist chunks when an active entity leaves the world', function() {
      });

      it.skip('Can be published to a world but is immediately unloaded after', function() {
      });
    });

    describe.skip('Loading and unloading worlds around failed entity publishing', function() {
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