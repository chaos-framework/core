import { expect } from 'chai';
import 'mocha';
import { Chaos, Entity, Team, Player } from '../../../src/internal.js';

import Room from '../../Mocks/Worlds/Room.js';

describe('Game', () => {
  beforeEach(() => { Chaos.reset(); });

  describe('Serializing with scope for client', () => {
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
      Chaos.addWorld(otherRoom);
      e = new Entity({ active: true });
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
  });
});
