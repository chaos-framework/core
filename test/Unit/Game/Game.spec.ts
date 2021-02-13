import { expect } from 'chai';
import 'mocha';
import { Game, Entity, Team, Vector, RelativeMoveAction, Player, VisibilityType } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import Room from '../../Mocks/Worlds/Room';

describe('Game', () => {
  let game: Game;
  beforeEach(() => { game = new EmptyGame({}) })

  it('Should be a singleton', () => {
    expect(game).to.be.not.null;
    expect(Game.getInstance()).to.be.not.null;
    expect(Game.getInstance()).to.equal(game);
  });

  describe('Default visibility functions', () => {
    let game: Game;
    let e: Entity;
    let world: Room;
    let amount: Vector;
    let team: Team;
    let player: Player;
    beforeEach(() => {
      game = new EmptyGame();
      game.perceptionGrouping = 'team';
      game.viewDistance = 1;
      world = new Room(5,5);
      game.worlds.set(world.id, world);
      e = new Entity({ name: "Test Entity" });
      e._publish(world, world.stageLeft);
      amount = new Vector(1,1);
      team = new Team({ name: 'Test' });
      game.teams.set('Test', team);
      player = new Player({ username: 'Test', teams: [team.id]})
      game.players.set(player.id, player);
      player._ownEntity(e);
    });
    
    it('Should return VISIBLE for team visibility if the entity is on the team', () => {
      const a = new RelativeMoveAction({caster: e, target: e, amount });
      expect(game.getVisibilityToTeam(a, team)).to.equal(VisibilityType.VISIBLE);
    });

    it('Should return VISIBLE for player visibility if the entity is owned by the player', () => {
      const a = new RelativeMoveAction({caster: e, target: e, amount });
      expect(game.getVisibilityToPlayer(a, player)).to.equal(VisibilityType.VISIBLE);
    });

    it('Should return VISIBLE for team visibility if an unowned entity is in scope', () => {
      const newEntity = new Entity({ name: "Unowned" });
      newEntity._publish(world, world.stageRight);
      const a = new RelativeMoveAction({caster: newEntity, target: newEntity, amount });
      expect(game.getVisibilityToTeam(a, team)).to.equal(VisibilityType.VISIBLE);
    });

    it('Should return VISIBLE for player visibility if an unowned entity is in scope', () => {
      const newEntity = new Entity({ name: "Unowned" });
      newEntity._publish(world, world.stageRight);
      const a = new RelativeMoveAction({caster: newEntity, target: newEntity, amount });
      expect(game.getVisibilityToPlayer(a, player)).to.equal(VisibilityType.VISIBLE);
    });

    it('Should return VISIBLE for entity visibility no matter what', () => {
      const a = new RelativeMoveAction({caster: e, target: e, amount });
      expect(game.getVisibilityToEntity(a, e)).to.equal(VisibilityType.VISIBLE);
    });
  });
});