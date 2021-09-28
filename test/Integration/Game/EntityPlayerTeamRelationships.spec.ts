import { expect } from 'chai';
import 'mocha';

import { Chaos, Team, Player, Entity } from '../../../src/internal';

// Attaching an entity, player, team etc to one another from either side should invoke the function of the other
// This is so that the developer doesn't need to know which is the "real" method to call
describe('Entity, Player, and Team Relationships', () => {
  beforeEach(() => { Chaos.reset() });
  
  describe('Entity-Player', () => {
    let entity: Entity;
    let player: Player;
    beforeEach(() => { 
      entity = new Entity();
      player = new Player();
    });

    it('Adding and removing from entity side', () => {
      entity._grantOwnershipTo(player);
      expect(entity.players.has(player.id)).to.be.true;
      expect(player.entities.has(entity.id)).to.be.true;
      entity._revokeOwnershipFrom(player);
      expect(entity.players.has(player.id)).to.be.false;
      expect(player.entities.has(entity.id)).to.be.false;
    });

    it('Adding and removing from player side', () => {
      player._ownEntity(entity);
      expect(entity.players.has(player.id)).to.be.true;
      expect(player.entities.has(entity.id)).to.be.true;
      player._disownEntity(entity);
      expect(entity.players.has(player.id)).to.be.false;
      expect(player.entities.has(entity.id)).to.be.false;
    });
  });

  describe('Entity-Team', () => {
    let entity: Entity;
    let team: Team;
    beforeEach(() => { 
      entity = new Entity();
      team = new Team();
    });

    it('Adding and removing from entity side', () => {
      entity._joinTeam(team);
      expect(entity.team).to.equal(team);
      expect(team.entities.has(entity.id)).to.be.true;
      entity._leaveTeam();
      expect(entity.team).to.be.undefined;
      expect(team.entities.has(entity.id)).to.be.false;
    });

    it('Adding and removing from team side', () => {
      team._addEntity(entity);
      expect(entity.team).to.equal(team);
      expect(team.entities.has(entity.id)).to.be.true;
      team._removeEntity(entity);
      expect(entity.team).to.be.undefined;
      expect(team.entities.has(entity.id)).to.be.false;
    });
  });

  describe('Player-Team', () => {
    let player: Player;
    let team: Team;
    beforeEach(() => { 
      team = new Team();
      player = new Player();
    });
    
    it('Adding and removing from player side', () => {
      player._joinTeam(team);
      expect(player.team).to.equal(team);
      expect(team.players.has(player.id)).to.be.true;
      player._leaveTeam();
      expect(player.team).to.be.undefined;
      expect(team.players.has(player.id)).to.be.false;
    });

    it('Adding and removing from team side', () => {
      team._addPlayer(player);
      expect(player.team).to.equal(team);
      expect(team.players.has(player.id)).to.be.true;
      team._removePlayer(player);
      expect(player.team).to.be.undefined;
      expect(team.players.has(player.id)).to.be.false;
    });
  });

});