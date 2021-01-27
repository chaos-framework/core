import { expect } from 'chai';
import 'mocha';

import { Game, Team, Player, Entity } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';

describe('Team, Player, and Entity relationships', () => {
  let game: Game;
  let team: Team;
  let player: Player;
  let entity: Entity;
  beforeEach(() => {
    game = new EmptyGame();
    team = new Team('Red');
    player = new Player({ username: 'Red Player' });
    entity = new Entity();
    game.addEntity(entity);
  });

  it('Team-Player', () => {
    team._addPlayer(player);
    player._ownEntity(entity);
    expect(team.players.has(player.id)).to.be.true;
    expect(player.teams.has(team.id)).to.be.true;
    team._removePlayer(player);
    expect(team.players.has(player.id)).to.be.false;
    expect(player.teams.has(team.id)).to.be.false;
  });

  it('Entity-Player', () => {
    team._addPlayer(player);
    player._ownEntity(entity);
    expect(player.entities.has(entity.id)).to.be.true;
    expect(entity.owners.has(player.id)).to.be.true;
    player._disownEntity(entity);
    expect(player.entities.has(entity.id)).to.be.false;
    expect(entity.owners.has(player.id)).to.be.false;
  });

  it('Team-Entity -- player joins team BEFORE owning entity', () => {
    team._addPlayer(player);
    player._ownEntity(entity);
    expect(team.entities.has(entity.id)).to.be.true;
    expect(entity.teams.has(team.id)).to.be.true;
    player._disownEntity(entity);
    expect(team.entities.has(entity.id)).to.be.false;
    expect(entity.teams.has(team.id)).to.be.false;
  });

  it('Team-Entity -- player joins team AFTER owning entity', () => {
    player._ownEntity(entity);
    team._addPlayer(player);
    expect(team.entities.has(entity.id)).to.be.true;
    expect(entity.teams.has(team.id)).to.be.true;
    player._disownEntity(entity);
    expect(team.entities.has(entity.id)).to.be.false;
    expect(entity.teams.has(team.id)).to.be.false;
  });

});
