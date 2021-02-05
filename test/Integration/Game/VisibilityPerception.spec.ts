import { expect } from 'chai';
import 'mocha';

import { Game, Team, Player, Entity, World, Vector } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import EntityVisibilityGame from '../../Mocks/Games/EntityVisibilityGame';
import Room from '../../Mocks/Worlds/Room';

const Red = 0;
const Blue = 1;
const teamNames: string[] = ['Red', 'Blue'];

describe('Action visibility and visibility grouping', () => {

  describe('Team visibility based purely on scope', () => {
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
      room = new Room(500, 500);
      game.worlds.set(room.id, room);
      entities = [new Entity({ name: "Test Entity" }), new Entity({ name: "Test Entity" })];
      entities[Red]._publish(room, new Vector(2, 2));
      entities[Blue]._publish(room, new Vector(450, 450));
      players[Red]._ownEntity(entities[Red]);
      players[Blue]._ownEntity(entities[Blue]);
    });

    it('Only broadcasts to Teams that have visibility', () => {
      // Execute an action that is visible only to nearby entities
      entities[Blue].moveRelative({ amount: new Vector(0, 1) }).execute();
      // Make sure that only the second entity will see this action
      expect(players[Blue].broadcastQueue.length).to.equal(1);
      expect(players[Red].broadcastQueue.length).to.equal(0);
      // Move the red player nearer to the blue, ensure that they both have visibility
      entities[Red].move({ to: new Vector(449, 449) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(2);
      expect(players[Red].broadcastQueue.length).to.equal(1);
      // Move the blue one tile again, ensure they both have visibility
      entities[Blue].moveRelative({ amount: new Vector(0, -1) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(3);
      expect(players[Red].broadcastQueue.length).to.equal(2);
      // Move the blue away, ensure they both have visibility
      entities[Blue].move({ to: new Vector(2, 2) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(4);
      expect(players[Red].broadcastQueue.length).to.equal(3);
    });
  });

  describe('Player visibility based purely on scope', () => {
    let game: Game;
    let players: Player[];
    let entities: Entity[];
    let room: Room;

    beforeEach(() => {
      game = new EmptyGame();
      game.perceptionGrouping = 'player';
      game.viewDistance = 1;
      players = [new Player({ username: 'Red' }), 
                new Player({ username: 'Blue' })];
      room = new Room(500, 500);
      game.worlds.set(room.id, room);
      entities = [new Entity({ name: "Test Entity" }), new Entity({ name: "Test Entity" })];
      entities[Red]._publish(room, new Vector(2, 2));
      entities[Blue]._publish(room, new Vector(450, 450));
      players[Red]._ownEntity(entities[Red]);
      players[Blue]._ownEntity(entities[Blue]);
    });

    it('Only broadcasts to Players that have visibility', () => {
      // Execute an action that is visible only to nearby entities
      entities[Blue].moveRelative({ amount: new Vector(0, 1) }).execute();
      // Make sure that only the second entity will see this action
      expect(players[Blue].broadcastQueue.length).to.equal(1);
      expect(players[Red].broadcastQueue.length).to.equal(0);
      // Move the red player nearer to the blue, ensure that they both have visibility
      entities[Red].move({ to: new Vector(449, 449) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(2);
      expect(players[Red].broadcastQueue.length).to.equal(1);
      // Move the blue one tile again, ensure they both have visibility
      entities[Blue].moveRelative({ amount: new Vector(0, -1) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(3);
      expect(players[Red].broadcastQueue.length).to.equal(2);
      // Move the blue away, ensure they both have visibility
      entities[Blue].move({ to: new Vector(2, 2) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(4);
      expect(players[Red].broadcastQueue.length).to.equal(3);
    });
  });

  describe('Team visibility for Players that are not on a team', () => {
    let game: Game;
    let teams: Team[];
    let players: Player[];
    let entities: Entity[];
    let room: Room;

    beforeEach(() => {
      game = new EmptyGame();
      game.perceptionGrouping = 'team';
      game.viewDistance = 1;
      teams = [new Team(teamNames[Red])];
      players = [new Player({ username: 'Red',  teams: [teams[Red].id] }), 
                new Player({ username: 'Blue' })];  // note that the blue player has no team
      room = new Room(500, 500);
      game.worlds.set(room.id, room);
      entities = [new Entity({ name: "Test Entity" }), new Entity({ name: "Test Entity" })];
      entities[Red]._publish(room, new Vector(2, 2));
      entities[Blue]._publish(room, new Vector(450, 450));
      players[Red]._ownEntity(entities[Red]);
      players[Blue]._ownEntity(entities[Blue]);
    });

    it('Broadcast to teams and individual players that have visibility', () => {
      // Execute an action that is visible only to nearby entities
      entities[Blue].moveRelative({ amount: new Vector(0, 1) }).execute();
      // Make sure that only the second entity will see this action
      expect(players[Blue].broadcastQueue.length).to.equal(1);
      expect(players[Red].broadcastQueue.length).to.equal(0);
      // Move the red player nearer to the blue, ensure that they both have visibility
      entities[Red].move({ to: new Vector(449, 449) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(2);
      expect(players[Red].broadcastQueue.length).to.equal(1);
      // Move the blue one tile again, ensure they both have visibility
      entities[Blue].moveRelative({ amount: new Vector(0, -1) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(3);
      expect(players[Red].broadcastQueue.length).to.equal(2);
      // Move the blue away, ensure they both have visibility
      entities[Blue].move({ to: new Vector(2, 2) }).execute();
      expect(players[Blue].broadcastQueue.length).to.equal(4);
      expect(players[Red].broadcastQueue.length).to.equal(3);
    });
  });

  describe('Entity-level visibility deferral for team-based visibility', () => {
    let game: Game;
    let teams: Team[];
    let players: Player[];
    let entities: Entity[];
    let room: Room;

    beforeEach(() => {
      game = new EntityVisibilityGame(); // note game class
      game.perceptionGrouping = 'team';
      game.viewDistance = 1;
      teams = [new Team(teamNames[Red]), new Team(teamNames[Blue])];
      players = [new Player({ username: 'Red',  teams: [teams[Red].id] }), 
                new Player({ username: 'Blue', teams: [teams[Blue].id] })];
      room = new Room(500, 500);
      game.worlds.set(room.id, room);
      entities = [new Entity({ name: "Test Entity" }), new Entity({ name: "Test Entity" })];
      entities[Red]._publish(room, new Vector(2, 2));
      entities[Blue]._publish(room, new Vector(3, 3));  // entities are already nearby
      players[Red]._ownEntity(entities[Red]);
      players[Blue]._ownEntity(entities[Blue]);
    });

    it('Will fall back to entity-level if team and player defers', () => {
      // Execute an action that is visible only to nearby entities
      entities[Blue].moveRelative({ amount: new Vector(0, 1) }).execute();
      // Make sure that only the second entity will see this action
      expect(players[Blue].broadcastQueue.length).to.equal(1);
      expect(players[Red].broadcastQueue.length).to.equal(0);
    });
  });
  
});
