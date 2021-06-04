import { expect } from 'chai';
import 'mocha';

import { RelativeMoveAction, Entity, Game, Vector, ActionType } from '../../../../src/internal';

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

  it('Moves an entity relatively', () => {
    const a = new RelativeMoveAction({ target, amount: new Vector(1, 0) });
    a.apply();
    expect(target.position.x).to.equal(room.stageLeft.x + 1);
  });

  it('Serializes to a proper object', () => {
    const amount = new Vector(1, 0);
    const a = new RelativeMoveAction({ target, amount });
    const o = a.serialize();
    expect(o.target).to.equal(target.id);
    expect(o.amount).to.equal(amount.serialize());
  });

  it('Can deserialize from an object', () => {
    const json: RelativeMoveAction.Serialized = { target: target.id, amount: new Vector(1, 0).serialize(), permitted: true, actionType: ActionType.RELATIVE_MOVE_ACTION }
    const a = RelativeMoveAction.deserialize(json);
    expect(a instanceof RelativeMoveAction).to.be.true;
    expect(a.target).to.equal(target);
    expect(a.amount.x).to.equal(1);
  });
  
});
