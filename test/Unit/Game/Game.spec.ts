import { expect } from 'chai';
import 'mocha';
import { Chaos, Entity, Team, Vector, RelativeMoveAction, Player, VisibilityType } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';

describe('Game', () => {
  beforeEach(() => { Chaos.reset(); });

  describe('Serializing with scope for client', () =>{
    let p: Player;
    let e: Entity;
    let red: Team;
    let blue: Team;
    let room: Room;
    let otherRoom: Room;
    let serialized: Chaos.SerializedForClient;
    beforeEach(() => {
      p = new Player({ username: 'Viewer'});
      Chaos.players.set(p.id, p);
      red = new Team({name: 'Red'});
      blue = new Team({name: 'Blue'});
      red._addPlayer(p);
      room = new Room();
      otherRoom = new Room();
      Chaos.addWorld(room);
      e = new Entity();
      e._publish(room, room.stageLeft);
      p._ownEntity(e);
      serialized = Chaos.serializeForScope(p);
    });

    it('Serializes everything a client would need', () => {
      // Name
      expect(serialized.id).to.equal(Chaos.id);
      // Teams
      expect(serialized.teams.find(team => team.id === red.id)).to.exist;
      expect(serialized.teams.find(team => team.id === blue.id)).to.exist;
      // Player
      const player = serialized.players.find(sp => sp.id === p.id);
      expect(player).to.exist;
      expect(player!.entities).to.contain(e.id);
      expect(player!.team).to.equal(red.id);
      // Worlds
      const world = serialized.worlds.find(sw => sw.id === room.id);
      expect(world).to.exist;
      expect(serialized.worlds).to.not.contain(otherRoom.id);
    });

    it('Deserializes into a ClientGame correctly', () => {
      Chaos.DeserializeAsClient(serialized, '');
      expect(Chaos.entities.has(e.id)).to.be.true;
    });
  })

  // LOL NOT ANYMORE
  // it('Should be a singleton', () => {
  //   expect(game).to.be.not.null;
  //   expect(Chaos.).to.be.not.null;
  //   expect(Chaos.).to.equal(game);
  // });

  // describe('Default visibility functions', () => {
  //   let game: Game;
  //   let e: Entity;
  //   let world: Room;
  //   let amount: Vector;
  //   let team: Team;
  //   let player: Player;
  //   beforeEach(() => {
  //     Chaos.reset();
  //     game.perceptionGrouping = 'team';
  //     game.viewDistance = 1;
  //     world = new Room(5,5);
  //     game.worlds.set(world.id, world);
  //     e = new Entity({ name: "Test Entity" });
  //     e._publish(world, world.stageLeft);
  //     amount = new Vector(1,1);
  //     team = new Team({ name: 'Test' });
  //     game.teams.set('Test', team);
  //     player = new Player({ username: 'Test', teams: [team.id]})
  //     game.players.set(player.id, player);
  //     player._ownEntity(e);
  //   });
    
  //   it('Should return VISIBLE for team visibility if the entity is on the team', () => {
  //     const a = new RelativeMoveAction({caster: e, target: e, amount });
  //     expect(game.getActionVisibilityToTeam(a, team)).to.equal(VisibilityType.VISIBLE);
  //   });

  //   it('Should return VISIBLE for player visibility if the entity is owned by the player', () => {
  //     const a = new RelativeMoveAction({caster: e, target: e, amount });
  //     expect(game.getActionVisibilityToPlayer(a, player)).to.equal(VisibilityType.VISIBLE);
  //   });

  //   it('Should return VISIBLE for team visibility if an unowned entity is in scope', () => {
  //     const newEntity = new Entity({ name: "Unowned" });
  //     newEntity._publish(world, world.stageRight);
  //     const a = new RelativeMoveAction({caster: newEntity, target: newEntity, amount });
  //     expect(game.getActionVisibilityToTeam(a, team)).to.equal(VisibilityType.VISIBLE);
  //   });

  //   it('Should return VISIBLE for player visibility if an unowned entity is in scope', () => {
  //     const newEntity = new Entity({ name: "Unowned" });
  //     newEntity._publish(world, world.stageRight);
  //     const a = new RelativeMoveAction({caster: newEntity, target: newEntity, amount });
  //     expect(game.getActionVisibilityToPlayer(a, player)).to.equal(VisibilityType.VISIBLE);
  //   });

  //   it('Should return VISIBLE for entity visibility no matter what', () => {
  //     const a = new RelativeMoveAction({caster: e, target: e, amount });
  //     expect(game.getActionVisibilityToEntity(a, e)).to.equal(VisibilityType.VISIBLE);
  //   });
  // });
});