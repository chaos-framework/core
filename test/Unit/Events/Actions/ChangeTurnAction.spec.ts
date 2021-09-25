import { expect } from 'chai';
import 'mocha';

import { Chaos, Entity, Player, Team, ChangeTurnAction } from '../../../../src/internal';
import Room from '../../../Mocks/Worlds/Room';

describe('Change Turn Action', () => {
  describe('Changes who/what has current the turn', () => {
    it('Can grant the turn to an entity', () => {
      const to = new Entity();
      let action = new ChangeTurnAction({ to });
      action.apply();
      expect(Chaos.currentTurn === to);
    });
    
    it('Can grant the turn to a player', () => {
      const to = new Player();
      let action = new ChangeTurnAction({ to });
      action.apply();
      expect(Chaos.currentTurn === to);
    });
    
    it('Can grant the turn to a team', () => {
      const to = new Team();
      let action = new ChangeTurnAction({ to });
      action.apply();
      expect(Chaos.currentTurn === to);
    });

    it('Can grant the turn to undefined', () => {
      let action = new ChangeTurnAction({ to: undefined });
      action.apply();
      expect(Chaos.currentTurn === undefined);
    });

  });

  it('Serializes to json', () => {
    const entity = new Entity();
    const action = new ChangeTurnAction({ to: entity });
    const serialized = action.serialize();
    expect(serialized.type).to.equal('Entity');
    expect(serialized.to).to.equal(entity.id);
  });

  it('Can deserialize from an object', () => {
    const entity = new Entity();
    const room = new Room();
    entity._publish(room, room.stageLeft);
    const json = {
      type: 'Entity',
      to: entity.id
    };
    const deserialized = ChangeTurnAction.deserialize(json);
    expect(deserialized.to).to.equal(entity);
  });
  
});
