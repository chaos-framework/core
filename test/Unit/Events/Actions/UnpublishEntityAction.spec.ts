import { expect } from 'chai';
import 'mocha';

import {
  UnpublishEntityAction,
  Entity,
  Chaos,
  Vector,
  ActionType
} from '../../../../src/internal.js';

import Room from '../../../Mocks/Worlds/Room.js';

describe('UnpublishEntityAction', () => {
  let target: Entity;
  let world: Room;
  let position: Vector;

  beforeEach(() => {
    Chaos.reset();
    target = new Entity({ name: 'Test Entity' });
    world = new Room(10, 10);
    Chaos.worlds.set(world.id, world);
    target._publish(world, world.stageLeft);
  });

  it('Unpublishes the entity', () => {
    const a = new UnpublishEntityAction({ target });
    a.apply().next();
    expect(target.published).to.be.false;
  });

  it('Serializes to a proper object', () => {
    const a = new UnpublishEntityAction({ target });
    const o = a.serialize();
    expect(o.target).to.equal(target.id);
  });

  it('Can deserialize from proper json', () => {
    const json: UnpublishEntityAction.Serialized = {
      target: target.id,
      permitted: true,
      actionType: ActionType.UNPUBLISH_ENTITY_ACTION
    };
    const a = UnpublishEntityAction.deserialize(json);
    expect(a instanceof UnpublishEntityAction).to.be.true;
    expect(a.target.id).to.equal(target.id);
    expect(a.permitted).to.be.true;
  });
});
