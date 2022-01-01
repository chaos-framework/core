import { expect } from 'chai';
import 'mocha';

import { Component, Entity, Chaos, World, Vector, Player, Team, Viewer } from '../../src/internal.js';

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
      it.skip('Tracks chunks when published to a world', function () {
        entityA1._publish(fixedWorld1, Vector.zero());
      });

      it.skip('Tracks and forgets chunks when moving through a world', function () {
      });

      it.skip('Forgets chunks when unpublished from a world', function () {
      });

      it.skip('Updates chunks appropriately after a ChangeWorldAction', function () {
      });

      it.skip('Persists chunks when another active entity leaves the world', function () {
      });

      it.skip('Does not track chunks outside the bounds of the world', function () {
      });
    });

    describe.skip('Inactive entities', function() {

      it.skip('Does not track chunks when published to a world', function () {
      });

      it.skip('Does not track or forget chunks when moving through a world', function () {
      });

      it.skip('Does not persist chunks when an active entity leaves the world', function () {
      });

      it.skip('Can be published to a world but is immediately unloaded after', function () {

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