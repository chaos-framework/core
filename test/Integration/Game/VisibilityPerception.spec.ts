import { expect } from 'chai';
import 'mocha';

import { Game, Team, Player, Entity } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';

const Red = 0;
const Blue = 1;
const teamNames: string[] = ['Red', 'Blue'];

describe('Action visibility', () => {
  let game: Game;
  let teams: Team[];
  let players: Player[];
  let entities: Entity[];
  beforeEach(() => {
    game = new EmptyGame();
    teams = [new Team(teamNames[Red]), new Team(teamNames[Blue])];
    players = [new Player({ username: teamNames[Red], teams: [teamNames[Red]]}), 
               new Player({ username: teamNames[Blue], teams: [teamNames[Blue]]})];
    entities = [new Entity(), new Entity()];
    players[Red].entities.add(entities[Red].id);
    players[Blue].entities.add(entities[Blue].id);
  });

  // it('Only broadcasts to teams that have visibility', () => {});
});
