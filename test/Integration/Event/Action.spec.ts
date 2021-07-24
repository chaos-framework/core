import { expect } from 'chai';
import 'mocha';

import { Action, Entity, Chaos, MoveAction, RelativeMoveAction, Vector } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';
import { SensesAll } from '../../Mocks/Components/Functional';

describe('Action Integration', () => {
  describe('Caches sensory information from all involved entities', () => {
    let action: MoveAction;
    let witness: Entity;
    let mover: Entity;
    let room: Room;
      
    beforeEach(() => {
      Chaos.reset();
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

  describe('Lets various entities, worlds, and game listen to an action', () => {
    describe('Entities, targets, witnesses, and world when caster and target are in same world', () => {
      let action: RelativeMoveAction;
      let caster: Entity;
      let target: Entity;
      let casterWitness: Entity;
      let targetWitness: Entity;
      let room: Room;
            beforeEach(() => {
        Chaos.reset();
        room = new Room(100, 100);
        caster = new Entity();
        caster._publish(room, room.stageLeft);
        casterWitness = new Entity();
        casterWitness._publish(room, room.stageLeft.add(new Vector(0, -1)));
        target = new Entity();
        target._publish(room, room.stageRight);
        targetWitness = new Entity();
        targetWitness._publish(room, room.stageRight.add(new Vector(0, -1)));
        action = new RelativeMoveAction({ 
          caster, target, amount: new Vector(1, 0)
        });
        Chaos.listenDistance = 25; // the default, but enforcing just in case
      });

      it('Includes caster, target, their worlds, witnesses in respective worlds, and the game', () => {
        action.collectListeners()
        expect(action.listeners.find(el => el === caster)).to.exist;
        expect(action.listeners.find(el => el === target)).to.exist;
        expect(action.listeners.find(el => el === casterWitness)).to.exist;
        expect(action.listeners.find(el => el === targetWitness)).to.exist;
        expect(action.listeners.find(el => el === room)).to.exist;
        expect(action.listeners.find(el => el === game)).to.exist;
      });

      it('Does not include witnesses that are outside of listening radius', () => {
        const nearbyWitness = new Entity();
        nearbyWitness._publish(room, room.stageLeft.add(new Vector(10, 10)));
        const tooFarWitness = new Entity();
        tooFarWitness._publish(room, room.stageLeft.add(new Vector(20, 40)));
        action.collectListeners();
        expect(action.listeners.find(el => el === nearbyWitness)).to.exist;
        expect(action.listeners.find(el => el === tooFarWitness)).to.not.exist;
      });

    });

    describe('Entities, targets, witnesses, and worlds when caster and target are in different worlds', () => {
      let action: RelativeMoveAction;
      let caster: Entity;
      let target: Entity;
      let casterWitness: Entity;
      let targetWitness: Entity;
      let casterRoom: Room;
      let targetRoom: Room;
            beforeEach(() => {
        Chaos.reset();
        casterRoom = new Room();
        targetRoom = new Room();
        caster = new Entity();
        caster._publish(casterRoom, casterRoom.stageLeft);
        casterWitness = new Entity();
        casterWitness._publish(casterRoom, casterRoom.stageLeft.add(new Vector(0, -1)));
        target = new Entity();
        target._publish(targetRoom, targetRoom.stageRight);
        targetWitness = new Entity();
        targetWitness._publish(targetRoom, targetRoom.stageLeft.add(new Vector(0, -1)));
        action = new RelativeMoveAction({ 
          caster, target, amount: new Vector(1, 0)
        });
      });

      it('Includes caster, target, their worlds, witnesses in respective worlds, and the game', () => {
        action.collectListeners();
        expect(action.listeners.find(el => el === caster)).to.exist;
        expect(action.listeners.find(el => el === target)).to.exist;
        expect(action.listeners.find(el => el === casterWitness)).to.exist;
        expect(action.listeners.find(el => el === targetWitness)).to.exist;
        expect(action.listeners.find(el => el === casterRoom)).to.exist;
        expect(action.listeners.find(el => el === targetRoom)).to.exist;
        expect(action.listeners.find(el => el === game)).to.exist;
      });
    });
  });
});
