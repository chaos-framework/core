import { expect } from 'chai';
import 'mocha';

import { Entity, Property, PropertyThresholdAction } from '../../../../src/internal.js';

describe('PropertyChangeAction', function () {
  let target: Entity;
  let property: Property;
  this.beforeEach(function () {
    target = new Entity();
    target._addProperty('HP', 5, 0, 10); // TODO override with direct property assignment
    property = target.properties.get('HP')!;
  });

  describe('Adjusting properties', function () {
    it('Can adjust the min property', function () {
      property.min.adjust({ amount: 2 }).apply().next();
      expect(property.min.calculated).to.equal(2);
    });

    it('Can adjust the current property', function () {
      property.current.adjust({ amount: 2 }).apply().next();
      expect(property.current.calculated).to.equal(7);
    });

    it('Can adjust the max property', function () {
      property.max.adjust({ amount: 2 }).apply().next();
      expect(property.max.calculated).to.equal(12);
    });
  });

  describe('Setting properties', function () {
    it('Can adjust the min property', function () {
      property.min.set({ amount: -5 }).apply().next();
      expect(property.min.calculated).to.equal(-5);
    });

    it('Can adjust the current property', function () {
      property.current.set({ amount: 2 }).apply().next();
      expect(property.current.calculated).to.equal(2);
    });

    it('Can adjust the max property', function () {
      property.max.set({ amount: 5 }).apply().next();
      expect(property.max.calculated).to.equal(5);
    });
  });

  describe('Boundaries', function () {
    describe('Yielding actions', function () {
      describe('min', function () {
        describe('min changes', function () {
          it('Fires an action on matching', async function () {
            const gen = property.min.set({ amount: 5 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('min');
            expect(effect.newState).to.equal('equals');
          });

          it('Fires an action on crossing', async function () {
            const gen = property.min.set({ amount: 6 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('min');
            expect(effect.newState).to.equal('out');
          });
        });

        describe('current changes', function () {
          it('Fires an action on matching', async function () {
            const gen = property.current.set({ amount: 0 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('min');
            expect(effect.newState).to.equal('equals');
          });

          it('Fires an action on crossing', async function () {
            const gen = property.current.set({ amount: -1 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('min');
            expect(effect.newState).to.equal('out');
          });
        });
      });

      describe('max', function () {
        describe('max changes', function () {
          it('Fires an action on matching', async function () {
            const gen = property.max.set({ amount: 5 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('max');
            expect(effect.newState).to.equal('equals');
          });

          it('Fires an action on crossing', async function () {
            const gen = property.max.set({ amount: 4 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('max');
            expect(effect.newState).to.equal('out');
          });
        });

        describe('current changes', async function () {
          it('Fires an action on matching', async function () {
            const gen = property.current.set({ amount: 10 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('max');
            expect(effect.newState).to.equal('equals');
          });

          it('Fires an action on crossing', async function () {
            const gen = property.current.set({ amount: 11 }).apply();
            const [, effect] = (await gen.next()).value as [any, PropertyThresholdAction];
            expect(effect instanceof PropertyThresholdAction).to.be.true;
            expect(effect.propertyName).to.equal('HP');
            expect(effect.threshold).to.equal('max');
            expect(effect.newState).to.equal('out');
          });
        });
      });
    });

    it('Should not allow minimum to be greater than maximum, and vice-versa', async function () {
      let gen = property.min.set({ amount: 11 }).apply();
      expect((await gen.next()).value).to.be.false;
      expect(property.min.calculated).to.equal(0);
      gen = property.max.set({ amount: -1 }).apply();
      expect((await gen.next()).value).to.be.false;
      expect(property.max.calculated).to.equal(10);
    });
  });
});
