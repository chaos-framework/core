import { expect } from 'chai';
import 'mocha';

import { Chaos, Entity, Player, Team, ChangeTurnAction } from '../../../../src/internal.js';
import Room from '../../../Mocks/Worlds/Room.js';

describe('Change Turn Action', () => {
  describe('Changes who/what has current the turn', () => {
    it('Can grant the turn target an entity', () => {
      const target = new Entity();
      let action = new ChangeTurnAction({ target });
      action.apply();
      expect(Chaos.currentTurn === target);
    });

    it('Can grant the turn target a player', () => {
      const target = new Player();
      let action = new ChangeTurnAction({ target });
      action.apply();
      expect(Chaos.currentTurn === target);
    });

    it('Can grant the turn target a team', () => {
      const target = new Team();
      let action = new ChangeTurnAction({ target });
      action.apply();
      expect(Chaos.currentTurn === target);
    });

    it('Can grant the turn target undefined', () => {
      let action = new ChangeTurnAction({ target: undefined });
      action.apply();
      expect(Chaos.currentTurn === undefined);
    });
  });

  it('Serializes target json', () => {
    const entity = new Entity();
    const action = new ChangeTurnAction({ target: entity });
    const serialized = action.serialize();
    expect(serialized.type).to.equal('Entity');
    expect(serialized.target).to.equal(entity.id);
  });

  it('Can deserialize from an object', () => {
    const entity = new Entity();
    const room = new Room();
    entity._publish(room, room.stageLeft);
    const json = {
      type: 'Entity',
      target: entity.id
    };
    const deserialized = ChangeTurnAction.deserialize(json);
    expect(deserialized.target).to.equal(entity);
  });
});
