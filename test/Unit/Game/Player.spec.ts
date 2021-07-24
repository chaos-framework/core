import { expect } from 'chai';
import 'mocha';
import { validate as validateUuid } from 'uuid';

import { Chaos, Team, Player, Entity } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';

describe('Player', () => {
  let game: Game;
  let team: Team;
  let otherTeam: Team;
  beforeEach(() => {
    game = new EmptyGame();
    team = new Team({ name: 'Red' });
    otherTeam = new Team({ name: 'Blue' });
    game.teams.set(team.id, team);
    game.teams.set(otherTeam.id, otherTeam);
  });

  describe('Serializing and Deserializing', () => {
    let player: Player;
    let e: Entity;
    beforeEach(() => {
      player = new Player({ username: 'Serializing Test' });
      e = new Entity();
      game.addEntity(e);
      player._ownEntity(e);
    });

    it('Serializes for the client properly', () => {
      const serialized = player.serializeForClient();
      expect(serialized.id).to.equal(player.id);
      expect(serialized.username).to.equal(player.username);
      expect(serialized.admin).to.equal(player.admin);
      expect(serialized.entities).to.contain(e.id);
    });
    
    it('Deserializes for the client properly', () => {
      const serialized = player.serializeForClient();
      const deserialized = Player.DeserializeAsClient(serialized);
      expect(deserialized.id).to.equal(player.id);
      expect(deserialized.username).to.equal(player.username);
      expect(deserialized.admin).to.equal(player.admin);
      expect(deserialized.entities.has(e.id)).to.be.true;
    });
  });

  describe('Construction', () => {
    it('Gets assigned a uuid and accepts username', () => {
      const player = new Player({ username: 'Test' });
      expect(player.id).to.exist;
      expect(validateUuid(player.id)).to.be.true;
      expect(player.username).to.equal('Test');
    });

    it('Can optionally join teams during construction', () => {
      const player = new Player({ username: 'Test', teams: [team.id, otherTeam.id] });
      expect(player.teams.map.size).to.equal(2);
    });

    it('Has own scope and entities tracked if visibility grouping is at player level', () => {
      game.perceptionGrouping = 'player'; // default
      const player = new Player({ username: 'Test', teams: [team.id] });
      expect(player.scopesByWorld != team.scopesByWorld).to.be.true;
    });

    it('Shares scope and entities in sight with a team if visibility grouping is at team level', () => {
      game.perceptionGrouping = 'team';
      const player = new Player({ username: 'Test', teams: [team.id] });
      expect(player.scopesByWorld === team.scopesByWorld).to.be.true;
    });

    it('Cannot join more than one team if visibility grouping is at team level', () => {
      game.perceptionGrouping = 'team';
      expect(() => new Player({ username: 'Test', teams: [team.id, otherTeam.id] })).to.throw();
    });
  });

  describe('Joining and leaving teams', () => {
    it('Can join a team when perception is at player level', () => {
      game.perceptionGrouping = 'player'; // default
      const player = new Player({ username: 'Red Player' });
      expect(player._joinTeam(team)).to.be.true;
      expect(player.teams.has(team.id)).to.be.true;
    });

    it('Can leave a team when perception is at player level', () => {
      game.perceptionGrouping = 'player'; // default
      const player = new Player({ username: 'Red Player' });
      player._joinTeam(team);
      expect(player._leaveTeam(team)).to.be.true;
      expect(player.teams.has(team.id)).to.be.false;
    });

    it('Cannot join a team after construction when perception is at team level', () => {
      game.perceptionGrouping = 'team';
      const player = new Player({ username: 'Red Player', teams: [team.id] });
      expect(player._joinTeam(otherTeam)).to.be.false;
      expect(player.teams.has(otherTeam.id)).to.be.false;
    });

    it('Cannot leave a team after construction when perception is at player level', () => {
      game.perceptionGrouping = 'team';
      const player = new Player({ username: 'Red Player', teams: [team.id] });
      expect(player._leaveTeam(team)).to.be.false;
      expect(player.teams.has(team.id)).to.be.true;
    });

    it('Cannot join a team already joined', () => {
      const player = new Player({ username: 'Red Player' });
      player._joinTeam(team);
      expect(player._joinTeam(team)).to.be.false;
    });

    it('Cannot leave a team never joined', () => {
      const player = new Player({ username: 'Red Player' });
      expect(player._leaveTeam(team)).to.be.false;
    });
  });

  // Owning and disowning entities, along with scope modifications, handled in integration tests
});