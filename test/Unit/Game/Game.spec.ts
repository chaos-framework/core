import { expect } from 'chai';
import 'mocha';
import { Game, Entity, Team, Vector, RelativeMoveAction, Player } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';

describe('Game', () => {
  let game: Game;
  beforeEach(() => { game = new EmptyGame({}) })

  it('Should be a singleton', () => {
    expect(game).to.be.not.null;
    expect(Game.getInstance()).to.be.not.null;
    expect(Game.getInstance()).to.equal(game);
  });

  describe('Visibility functions', () => {
    let e: Entity;
    let amount: Vector;
    let a: RelativeMoveAction;
    let team: Team;
    let player: Player;
    beforeEach(() => {
      e = new Entity();
      amount = new Vector(1,1);
      a = new RelativeMoveAction({caster: e, target: e, amount });
      team = new Team('Test');
      game.teams.set('Test', team);
      player = new Player({ username: 'Test', teams: [team.id]})
      game.players.set(player.id, player);
    });
    
    // TODO these only work for things in-scope now
    // it('Should return VISIBLE by default for team visibility', () => {
    //   expect(game.getVisibilityToTeam(a, team)).to.equal(VisibilityType.VISIBLE);
    // });

    // it('Should return true by default for player visibility', () => {
    //   expect(game.getVisibilityToPlayer(a, player)).to.equal(VisibilityType.VISIBLE);
    // });
    
    // it('Should return true by default for entity visibility', () => {
    //   expect(game.getVisibilityToEntity(a, e)).to.equal(VisibilityType.VISIBLE);
    // });
  });
});