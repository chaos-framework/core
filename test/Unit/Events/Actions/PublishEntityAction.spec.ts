import { expect } from 'chai';
import 'mocha';

import { PublishEntityAction, Entity, Game, Vector } from '../../../../src/internal';

import EmptyGame from '../../../Mocks/Games/EmptyGame';
import Room from '../../../Mocks/Worlds/Room';

describe('PublishEntityAction', () => {
  let game: Game;
  let entity: Entity;
  let world: Room;
  let position: Vector;

  beforeEach(() => {
    game = new EmptyGame({});
    entity = new Entity({ name: "Test Entity" });
    world = new Room(10, 10);
    game.worlds.set(world.id, world);
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
    const json: PublishEntityAction.Serialized = { entity: entity.serializeForClient(), world: world.id, position: position.serialize(), permitted: true };
    const a = PublishEntityAction.deserialize(json);
    expect(a instanceof PublishEntityAction).to.be.true;
    expect(a.entity.id).to.equal(entity.id);
    expect(a.entity.name).to.equal(entity.name);
    expect(a.world).to.equal(world);
    expect(a.position.equals(position)).to.be.true;
  });

});
