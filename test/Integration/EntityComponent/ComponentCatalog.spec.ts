// tslint:disable: no-unused-expression

import { expect } from 'chai';
import 'mocha';

import { Component, Entity, Chaos } from '../../../src/internal';

import Room from '../../Mocks/Worlds/Room';
import { EntityScopeSpecified, GameScopeSpecified, NoScopeSpecified, WorldScopeSpecified } from '../../Mocks/Components/Functional';

describe('ComponentCatalog and ComponentContainer integration', () => {
  let entity: Entity;
  let room: Room;

  beforeEach(() => {
    Chaos.reset();
    entity = new Entity();
    room = new Room();
  });

  describe('Subscribing components', () => {
    describe('As an entity', () => {
      describe('When Published', () => {
        beforeEach(() => {
          room.publish();
          entity._publish(room, room.stageLeft);
        })

        describe('Subscribes components at the appropriate scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for entity-scoped components', () => {
            const c = new EntityScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to the world if scoped appropriately and published to one', () => {
            const c = new WorldScopeSpecified();
            entity.components.addComponent(c);
            expect(room.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(room.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(room.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to game if scoped appropriately', () => {
            const c = new GameScopeSpecified();
            entity.components.addComponent(c);
            expect(Chaos.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(Chaos.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(Chaos.components.subscribersByType.reacter.get(c.id)).to.exist;
          });
        });
      });

      describe('When not published', () => {
        describe('Subscribes to self for all components', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for entity-scoped components', () => {
            const c = new EntityScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for game-scoped components', () => {
            const c = new GameScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribersByType.reacter.get(c.id)).to.exist;
          });
        });
      });

      describe('After publishing', () => {
        let entityScoped: Component;
        let worldScoped: Component;
        let gameScoped: Component;

        beforeEach(() => {
          room.publish();
          entityScoped = new EntityScopeSpecified();
          worldScoped = new WorldScopeSpecified();
          gameScoped = new GameScopeSpecified();
          entity.components.addComponent(entityScoped);
          entity.components.addComponent(worldScoped);
          entity.components.addComponent(gameScoped);
          entity._publish(room, room.stageLeft);
        });

        it('Should keep the entity-scoped components subscribed locally', () => {
          expect(entity.components.subscribersByType.sensor.get(entityScoped.id)).to.exist;
          expect(entity.components.subscribersByType.modifier.get(entityScoped.id)).to.exist;
          expect(entity.components.subscribersByType.reacter.get(entityScoped.id)).to.exist;
        });

        it('Should NOT keep the world or game-scoped components subscribed locally', () => {
          expect(entity.components.subscribersByType.sensor.get(worldScoped.id)).to.not.exist;
          expect(entity.components.subscribersByType.modifier.get(worldScoped.id)).to.not.exist;
          expect(entity.components.subscribersByType.reacter.get(worldScoped.id)).to.not.exist;
          expect(entity.components.subscribersByType.sensor.get(gameScoped.id)).to.not.exist;
          expect(entity.components.subscribersByType.modifier.get(gameScoped.id)).to.not.exist;
          expect(entity.components.subscribersByType.reacter.get(gameScoped.id)).to.not.exist;
        });

        it('Should subscribe to world scope when published', () => {
          expect(room.components.subscribersByType.sensor.get(worldScoped.id)).to.exist;
          expect(room.components.subscribersByType.modifier.get(worldScoped.id)).to.exist;
          expect(room.components.subscribersByType.reacter.get(worldScoped.id)).to.exist;
        });

        it('Should subscribe to game scope when published', () => {
          expect(Chaos.components.subscribersByType.sensor.get(gameScoped.id)).to.exist;
          expect(Chaos.components.subscribersByType.modifier.get(gameScoped.id)).to.exist;
          expect(Chaos.components.subscribersByType.reacter.get(gameScoped.id)).to.exist;
        });
      });

      describe('After unpublishing', () => {
        let entityScoped: Component;
        let worldScoped: Component;
        let gameScoped: Component;

        beforeEach(() => {
          room.publish();
          entityScoped = new EntityScopeSpecified();
          worldScoped = new WorldScopeSpecified();
          gameScoped = new GameScopeSpecified();
          entity.components.addComponent(entityScoped);
          entity.components.addComponent(worldScoped);
          entity.components.addComponent(gameScoped);
          entity._publish(room, room.stageLeft);
          entity._unpublish();
        });

        it('Should no longer be subscribed to other components', () => {
          expect(room.components.subscribersByType.sensor.get(worldScoped.id)).to.not.exist;
          expect(room.components.subscribersByType.modifier.get(worldScoped.id)).to.not.exist;
          expect(room.components.subscribersByType.reacter.get(worldScoped.id)).to.not.exist;
          expect(Chaos.components.subscribersByType.sensor.get(gameScoped.id)).to.not.exist;
          expect(Chaos.components.subscribersByType.modifier.get(gameScoped.id)).to.not.exist;
          expect(Chaos.components.subscribersByType.reacter.get(gameScoped.id)).to.not.exist;
        });
      });
    });

    describe('As a world', () => {
      describe('When Published', () => {
        beforeEach(() => {
          room.publish();
        });

        describe('Subscribes components at the appropriate scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(room.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(room.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(room.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(room.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to game if scoped appropriately', () => {
            const c = new GameScopeSpecified();
            room.components.addComponent(c);
            expect(Chaos.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(Chaos.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(Chaos.components.subscribersByType.reacter.get(c.id)).to.exist;
          });
        });
      });

      describe('When not published', () => {
        describe('Subscribes to self for all scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(room.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(room.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(room.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(room.components.subscribersByType.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for game-scoped components', () => {
            const c = new GameScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribersByType.sensor.get(c.id)).to.exist;
            expect(room.components.subscribersByType.modifier.get(c.id)).to.exist;
            expect(room.components.subscribersByType.reacter.get(c.id)).to.exist;
          });
        });
      });

      // TODO publishing world after adding components
      // TODO unpublishing world after publishing with components
    });

    describe('As a game', () => {
      describe('Subscribes components at the appropriate scopes', () => {
        it('Subscribes at default scopes if none specified', () => {
          const c = new NoScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscribersByType.sensor.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.modifier.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.reacter.get(c.id)).to.exist;
        });

        it('Subscribes to self for entity-scoped components', () => {
          const c = new EntityScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscribersByType.sensor.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.modifier.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.reacter.get(c.id)).to.exist;
        });

        it('Subscribes to self for world-scoped components', () => {
          const c = new WorldScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscribersByType.sensor.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.modifier.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.reacter.get(c.id)).to.exist;
        });

        it('Subscribes to game (self) if scoped appropriately', () => {
          const c = new GameScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscribersByType.sensor.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.modifier.get(c.id)).to.exist;
          expect(Chaos.components.subscribersByType.reacter.get(c.id)).to.exist;
        });
      });
    });
  });


});
