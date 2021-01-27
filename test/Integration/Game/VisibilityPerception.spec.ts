import { expect } from 'chai';
import 'mocha';

import { Game, Team, Player, Entity, World, Vector } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import Room from '../../Mocks/Worlds/Room';

const Red = 0;
const Blue = 1;
const teamNames: string[] = ['Red', 'Blue'];

describe('Action visibility', () => {

  describe('Visibility based purely on scope, always visible others', () => {
    let game: Game;
    let teams: Team[];
    let players: Player[];
    let entities: Entity[];
    let room: Room;
    beforeEach(() => {
      game = new EmptyGame();
      game.perceptionGrouping = 'team';
      game.viewDistance = 1;
      teams = [new Team(teamNames[Red]), new Team(teamNames[Blue])];
      players = [new Player({ username: 'Red',  teams: [teams[Red].id] }), 
                new Player({ username: 'Blue', teams: [teams[Blue].id] })];
      entities = [new Entity(), new Entity()];
      players[Red]._ownEntity(entities[Red]);
      players[Blue]._ownEntity(entities[Blue]);
      room = new Room(500, 500);
      game.worlds.set(room.id, room);
    });

    // it.only('Only broadcasts to teams that have visibility', () => {
    //   entities[Red]._publish(room, new Vector(2, 2));
    //   entities[Blue]._publish(room, new Vector(450, 450));
    //   // Execute an action that is visible to nearby entities
    //   entities[Blue].moveRelative({ amount: new Vector(0, 1) }).execute();
    //   // Make sure that only the second entity will see this action
    //   expect(players[Blue].broadcastQueue.length).to.equal(1);
    //   expect(players[Red].broadcastQueue.length).to.equal(0);
    // });
  });
  
});
