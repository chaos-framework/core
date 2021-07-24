import { expect } from 'chai';
import 'mocha';

import { UnpublishEntityAction, Entity, Chaos, Vector, ActionType } from '../../../../src/internal';

import EmptyGame from '../../../Mocks/Games/EmptyGame';
import Room from '../../../Mocks/Worlds/Room';

describe('UnpublishEntityAction', () => {
  let game: Game;
  let entity: Entity;
  let world: Room;
  let position: Vector;

  beforeEach(() => {
    game = new EmptyGame({});
    entity = new Entity({ name: "Test Entity" });
    world = new Room(10, 10);
    game.worlds.set(world.id, world);
    entity._publish(world, world.stageLeft);
  });

  it('Unpublishes the entity', () => {
    const a = new UnpublishEntityAction({ entity });
    a.apply();
    expect(entity.published).to.be.false;
  });

  it('Serializes to a proper object', () => {
    const a = new UnpublishEntityAction({ entity });
    const o = a.serialize();
    expect(o.entity).to.equal(entity.id);
  });

  it('Can deserialize from proper json', () => {
    const json: UnpublishEntityAction.Serialized = { entity: entity.id, permitted: true, actionType: ActionType.UNPUBLISH_ENTITY_ACTION };
    const a = UnpublishEntityAction.deserialize(json);
    expect(a instanceof UnpublishEntityAction).to.be.true;
    expect(a.entity.id).to.equal(entity.id);
    expect(a.permitted).to.be.true;
  });

});
