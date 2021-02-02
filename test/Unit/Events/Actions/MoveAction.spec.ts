import { expect } from 'chai';
import 'mocha';

import { MoveAction, Entity, Game, Vector } from '../../../../src/internal';

import EmptyGame from '../../../Mocks/Games/EmptyGame';
import Room from '../../../Mocks/Worlds/Room';

describe('MoveAction', () => {
  let e: Entity;
  let game: Game;
  let room: Room;

  beforeEach(() => {
    game = new EmptyGame({});
    e = new Entity();
    room = new Room(10, 10);
    e._publish(room, room.stageLeft);
  });

  it('Moves an entity absolutely', () => {
    const a = new MoveAction({ target: e, to: e.position.add(new Vector(1, 0)) });
    a.apply();
    expect(e.position.x).to.equal(room.stageLeft.x + 1);
  });

  it('Can deserialize from proper json', () => {
    const json: MoveAction.Serialized = { target: e.id, to: room.stageLeft.add(new Vector(1, 0)).serialize(), permitted: true }
    const a = MoveAction.deserialize(json);
    expect(a instanceof MoveAction).to.be.true;
    expect(a.target).to.equal(e);
    expect(a.to.x).to.equal(room.stageLeft.x + 1);
  });
  
});
