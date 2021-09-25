import { expect } from 'chai';
import 'mocha';
import { validate as validateUuid } from 'uuid';

import { Chaos, Team, Player, Entity } from '../../../src/internal';


describe('Player', () => {
  let team: Team;
  let otherTeam: Team;
  beforeEach(() => {
    Chaos.reset();
    team = new Team({ name: 'Red' });
    otherTeam = new Team({ name: 'Blue' });
    Chaos.teams.set(team.id, team);
    Chaos.teams.set(otherTeam.id, otherTeam);
  });

  describe('Serializing and Deserializing', () => {
    let player: Player;
    let e: Entity;
    beforeEach(() => {
      player = new Player({ username: 'Serializing Test' });
      e = new Entity();
      Chaos.addEntity(e);
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
      const player = new Player({ username: 'Test', team: team.id });
      expect(player.team).to.equal(team);
    });

    it('Has own scope and entities tracked if visibility grouping is at player level', () => {
      Chaos.perceptionGrouping = 'player'; // default
      const player = new Player({ username: 'Test', team: team.id });
      expect(player.scopesByWorld != team.scopesByWorld).to.be.true;
    });

    it('Shares scope and entities in sight with a team if visibility grouping is at team level', () => {
      Chaos.perceptionGrouping = 'team';
      const player = new Player({ username: 'Test', team: team.id });
      expect(player.scopesByWorld === team.scopesByWorld).to.be.true;
    });
  });

  // Owning and disowning entities, along with scope modifications, handled in integration tests
});