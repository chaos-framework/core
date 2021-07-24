import { expect } from 'chai';
import 'mocha';

import { Chaos, Team, Player, Entity } from '../../../src/internal';


describe('Player and Game integration', () => {
    let teams: Team[];
  beforeEach(() => {
    Chaos.reset();
    teams = [new Team({ name: 'Red' }), new Team({ name: 'Blue' })];
  });

  describe('Tracking players without teams', () => {
    it('Tracks players with or without teams from the Player constructor', () => {
      const player = new Player({ username: 'Test', teams: [teams[0].id] });
      expect(Chaos.playersWithoutTeams.size).to.equal(0);
      const otherPlayer = new Player({ username: 'Blah' });
      expect(Chaos.playersWithoutTeams.size).to.equal(1);
    });

    it('Tracks players with or without teams that join/leave after construction', () => {
      const player = new Player({ username: 'Test' });
      player._joinTeam(teams[0]);
      expect(Chaos.playersWithoutTeams.size).to.equal(0);
      player._leaveTeam(teams[0]);
      expect(Chaos.playersWithoutTeams.size).to.equal(1);
    });

    it('Tracks players without teams correctly when joining or leaving multiple teams', () => {
      // Via constructor
      const player = new Player({ username: 'Test', teams: [teams[0].id, teams[1].id] });
      player._leaveTeam(teams[0]);
      expect(Chaos.playersWithoutTeams.size).to.equal(0);
      player._leaveTeam(teams[1]);
      expect(Chaos.playersWithoutTeams.size).to.equal(1);
      // Via action methods
      player._joinTeam(teams[0]);
      player._joinTeam(teams[1]);
      player._leaveTeam(teams[0]);
      expect(Chaos.playersWithoutTeams.size).to.equal(0);
    });
  });

});