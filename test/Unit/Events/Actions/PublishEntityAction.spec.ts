import { expect } from 'chai';
import 'mocha';

import { PublishEntityAction, Entity, Chaos, Vector, ActionType } from '../../../../src/internal.js';

import Room from '../../../Mocks/Worlds/Room.js';

describe('PublishEntityAction', () => {
  let entity: Entity;
  let world: Room;
  let position: Vector;

  beforeEach(() => {
    Chaos.reset();
    entity = new Entity({ name: "Test Entity" });
    world = new Room(10, 10);
    Chaos.worlds.set(world.id, world);
    position = world.stageLeft;
  });

  it('Publishes and entity', () => {
    const a = new PublishEntityAction({ entity, world, position });
    a.apply();
    expect(entity.world).to.equal(world);
    expect(entity.position.equals(position)).to.be.true;
    expect(entity.world).to.equal(world);
  });

  it('Serializes to a proper object', () => {
    const a = new PublishEntityAction({ entity, world, position });
    const o = a.serialize();
    expect(o.entity.id).to.equal(entity.id);
    expect(o.world).to.equal(world.id);
    expect(o.position).to.equal(position.serialize());
  });

  it('Can deserialize from proper json', () => {
    const json: PublishEntityAction.Serialized = { entity: entity.serializeForClient(), world: world.id, position: position.serialize(), permitted: true, actionType: ActionType.PUBLISH_ENTITY_ACTION };
    const a = PublishEntityAction.deserialize(json);
    expect(a instanceof PublishEntityAction).to.be.true;
    expect(a.entity.id).to.equal(entity.id);
    expect(a.entity.name).to.equal(entity.name);
    expect(a.world).to.equal(world);
    expect(a.position.equals(position)).to.be.true;
  });

});
