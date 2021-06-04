import { expect } from 'chai';
import 'mocha';

import { MoveAction, Entity, Game, Vector, ActionType } from '../../../../src/internal';

import EmptyGame from '../../../Mocks/Games/EmptyGame';
import Room from '../../../Mocks/Worlds/Room';

describe('MoveAction', () => {
  let target: Entity;
  let game: Game;
  let room: Room;

  beforeEach(() => {
    game = new EmptyGame({});
    target = new Entity({ name: "Test Entity" });
    room = new Room(10, 10);
    target._publish(room, room.stageLeft);
  });

  it('Moves an entity absolutely', () => {
    const a = new MoveAction({ target, to: target.position.add(new Vector(1, 0)) });
    a.apply();
    expect(target.position.x).to.equal(room.stageLeft.x + 1);
  });

  it('Serializes to a proper object', () => {
    const to = new Vector(1, 0);
    const a = new MoveAction({ target, to });
    const o = a.serialize();
    expect(o.target).to.equal(target.id);
    expect(o.to).to.equal(to.serialize());
  });

  it('Can deserialize from proper json', () => {
    const json: MoveAction.Serialized = { target: target.id, to: room.stageLeft.add(new Vector(1, 0)).serialize(), permitted: true, actionType: ActionType.MOVE_ACTION }
    const a = MoveAction.deserialize(json);
    expect(a instanceof MoveAction).to.be.true;
    expect(a.target).to.equal(target);
    expect(a.to.x).to.equal(room.stageLeft.x + 1);
  });
  
});
