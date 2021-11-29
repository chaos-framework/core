// tslint:disable: no-unused-expression

import { expect } from 'chai';
import 'mocha';

import { Component, Entity, Chaos } from '../../../src/internal.js';

import Room from '../../Mocks/Worlds/Room.js';
import { EntityScopeSpecified, GameScopeSpecified, NoScopeSpecified, WorldScopeSpecified } from '../../Mocks/Components/Functional.js';

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
        });

        describe('Subscribes components at the appropriate scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for entity-scoped components', () => {
            const c = new EntityScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to the world if scoped appropriately and published to one', () => {
            const c = new WorldScopeSpecified();
            entity.components.addComponent(c);
            expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
          expect(room.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to game if scoped appropriately', () => {
            const c = new GameScopeSpecified();
            entity.components.addComponent(c);
            expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });
        });
      });

      describe('When not published', () => {
        describe('Subscribes to self for all components', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for entity-scoped components', () => {
            const c = new EntityScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for game-scoped components', () => {
            const c = new GameScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
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
          expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(entityScoped.id)).to.exist;
          expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(entityScoped.id)).to.exist;
        });

        it('Should NOT keep the world or game-scoped components subscribed locally', () => {
          expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(worldScoped.id)).to.not.exist;
          expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(worldScoped.id)).to.not.exist;
          expect(entity.components.subscriberFunctionsByPhase.get('modify')?.get(gameScoped.id)).to.not.exist;
          expect(entity.components.subscriberFunctionsByPhase.get('react')?.get(gameScoped.id)).to.not.exist;
        });

        it('Should subscribe to world scope when published', () => {
          expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(worldScoped.id)).to.exist;
          expect(room.components.subscriberFunctionsByPhase.get('react')?.get(worldScoped.id)).to.exist;
        });

        it('Should subscribe to game scope when published', () => {
          expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(gameScoped.id)).to.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(gameScoped.id)).to.exist;
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
          expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(worldScoped.id)).to.not.exist;
          expect(room.components.subscriberFunctionsByPhase.get('react')?.get(worldScoped.id)).to.not.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(gameScoped.id)).to.not.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(gameScoped.id)).to.not.exist;
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
            expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(room.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(room.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to game if scoped appropriately', () => {
            const c = new GameScopeSpecified();
            room.components.addComponent(c);
            expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });
        });
      });

      describe('When not published', () => {
        describe('Subscribes to self for all scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(room.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(room.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
          });

          it('Subscribes to self for game-scoped components', () => {
            const c = new GameScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
            expect(room.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
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
          expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
        });

        it('Subscribes to self for entity-scoped components', () => {
          const c = new EntityScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
        });

        it('Subscribes to self for world-scoped components', () => {
          const c = new WorldScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
        });

        it('Subscribes to game (self) if scoped appropriately', () => {
          const c = new GameScopeSpecified();
          Chaos.components.addComponent(c);
          expect(Chaos.components.subscriberFunctionsByPhase.get('modify')?.get(c.id)).to.exist;
          expect(Chaos.components.subscriberFunctionsByPhase.get('react')?.get(c.id)).to.exist;
        });
      });
    });
  });

});
