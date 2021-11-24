import { expect } from 'chai';
import 'mocha';

import { Chaos, Team, Player, Entity } from '../../../src/internal.js';


describe('Player and Game integration', () => {
    let teams: Team[];
  beforeEach(() => {
    Chaos.reset();
    teams = [new Team({ name: 'Red' }), new Team({ name: 'Blue' })];
  });

  describe('Tracking players without teams', () => {
    it('Tracks players with or without teams from the Player constructor', () => {
      const player = new Player({ username: 'Test', team: teams[0].id });
      expect(Chaos.playersWithoutTeams.size).to.equal(0);
      const otherPlayer = new Player({ username: 'Blah' });
      expect(Chaos.playersWithoutTeams.size).to.equal(1);
    });

    it('Tracks players with or without teams that join/leave after construction', () => {
      const player = new Player({ username: 'Test' });
      player._joinTeam(teams[0]);
      expect(Chaos.playersWithoutTeams.size).to.equal(0);
      player._leaveTeam();
      expect(Chaos.playersWithoutTeams.size).to.equal(1);
    });
  });

});