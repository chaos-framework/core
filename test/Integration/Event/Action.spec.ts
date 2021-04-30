import { expect } from 'chai';
import 'mocha';

import { Action, Entity, Game, MoveAction, Vector } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';
import EmptyGame from '../../Mocks/Games/EmptyGame';
import { SensesAll } from '../../Mocks/Components/Functional';

describe('Action Integration', () => {
  describe('Caches sensory information from all involved entities', () => {
    let action: MoveAction;
    let witness: Entity;
    let mover: Entity;
    let room: Room;
    let game: Game;
    beforeEach(() => {
      game = new EmptyGame();
      room = new Room();
      witness = new Entity();
      witness._attach(new SensesAll());
      witness._publish(room, room.stageLeft);
      mover = new Entity();
      mover._publish(room, room.stageRight);
      action = new MoveAction({ 
        caster: mover,
        target: mover,
        to: mover.position.add(new Vector(1, 0))
      });
    });

    it('Assumes caster can sense everything, regardless of sensory components', () => {
      action.execute();
      expect(action.sensors.has(mover.id)).to.be.true;
      expect(action.sensors.get(mover.id)).to.be.true;
    });

    // it('Stores that witness has sensed the action', () => {
    //   action.execute();
    //   expect(action.sensors.has(witness.id)).to.be.true;
    //   expect(action.sensors.get(witness.id)).to.be.true;
    // });

  });
});