import { expect } from 'chai';
import 'mocha';

import { Entity, ChangeWorldAction } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import Room from '../../Mocks/Worlds/Room';

describe('World Changing Actions', () => {
  let room1: Room;
  let room2: Room;
  let e: Entity;

  beforeEach(() => {
    new EmptyGame({});
    room1 = new Room();
    room2 = new Room();
    e = new Entity({ name: "Test Entity" });
    e._publish(room1, room1.stageLeft);
  });

  it('Can move entities between worlds', () => {
    expect(e.world).to.equal(room1);
    const a = new ChangeWorldAction({target: e, from: room1, to: room2, position: room2.stageLeft});
    a.execute();
    expect(e.world).to.equal(room2);
    expect(e.position.equals(room2.stageLeft)).to.be.true;
  });
});
