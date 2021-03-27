// tslint:disable: no-unused-expression

import { expect } from 'chai';
import 'mocha';

import { Component, Entity, Game } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import Room from '../../Mocks/Worlds/Room';
import { EntityScopeSpecified, GameScopeSpecified, NoScopeSpecified, WorldScopeSpecified } from '../../Mocks/Components/Functional';

describe.only('ComponentCatalog and ComponentContainer integration', () => {
  let game: Game;
  let entity: Entity;
  let room: Room;

  beforeEach(() => {
    game = new EmptyGame();
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
            expect(entity.components.subscribers.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribers.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for entity-scoped components', () => {
            const c = new EntityScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribers.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribers.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to the world if scoped appropriately and published to one', () => {
            const c = new WorldScopeSpecified();
            entity.components.addComponent(c);
            expect(room.components.subscribers.sensor.get(c.id)).to.exist;
            expect(room.components.subscribers.modifier.get(c.id)).to.exist;
            expect(room.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to game if scoped appropriately', () => {
            const c = new GameScopeSpecified();
            entity.components.addComponent(c);
            expect(game.components.subscribers.sensor.get(c.id)).to.exist;
            expect(game.components.subscribers.modifier.get(c.id)).to.exist;
            expect(game.components.subscribers.reacter.get(c.id)).to.exist;
          });
        });
      });

      describe('When not published', () => {
        describe('Subscribes to self for all components', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribers.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribers.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for entity-scoped components', () => {
            const c = new EntityScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribers.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribers.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribers.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribers.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for game-scoped components', () => {
            const c = new GameScopeSpecified();
            entity.components.addComponent(c);
            expect(entity.components.subscribers.sensor.get(c.id)).to.exist;
            expect(entity.components.subscribers.modifier.get(c.id)).to.exist;
            expect(entity.components.subscribers.reacter.get(c.id)).to.exist;
          });
        });
      });

      describe('Added before eventually publishing', () => {
        let entityScoped: Component;
        let worldScoped: Component;
        let gameScoped: Component;

        beforeEach(() => {
          entityScoped = new EntityScopeSpecified();
          worldScoped = new WorldScopeSpecified();
          gameScoped = new GameScopeSpecified();
          entity.components.addComponent(entityScoped);
          entity.components.addComponent(worldScoped);
          entity.components.addComponent(gameScoped);
          entity._publish(room, room.stageLeft);
        });

        it('Should keep the entity-scoped components subscribed locally', () => {
          expect(entity.components.subscribers.sensor.get(entityScoped.id)).to.exist;
          expect(entity.components.subscribers.modifier.get(entityScoped.id)).to.exist;
          expect(entity.components.subscribers.reacter.get(entityScoped.id)).to.exist;
        });

      })
    });

    describe('As a world', () => {
      describe('When Published', () => {
        beforeEach(() => {
          room.publish();
        })

        describe('Subscribes components at the appropriate scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribers.sensor.get(c.id)).to.exist;
            expect(room.components.subscribers.modifier.get(c.id)).to.exist;
            expect(room.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribers.sensor.get(c.id)).to.exist;
            expect(room.components.subscribers.modifier.get(c.id)).to.exist;
            expect(room.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to game if scoped appropriately', () => {
            const c = new GameScopeSpecified();
            room.components.addComponent(c);
            expect(game.components.subscribers.sensor.get(c.id)).to.exist;
            expect(game.components.subscribers.modifier.get(c.id)).to.exist;
            expect(game.components.subscribers.reacter.get(c.id)).to.exist;
          });
        });
      });

      describe('When not published', () => {
        describe('Subscribes to self for all scopes', () => {
          it('Subscribes at default scopes if none specified', () => {
            const c = new NoScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribers.sensor.get(c.id)).to.exist;
            expect(room.components.subscribers.modifier.get(c.id)).to.exist;
            expect(room.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for world-scoped components', () => {
            const c = new WorldScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribers.sensor.get(c.id)).to.exist;
            expect(room.components.subscribers.modifier.get(c.id)).to.exist;
            expect(room.components.subscribers.reacter.get(c.id)).to.exist;
          });

          it('Subscribes to self for game-scoped components', () => {
            const c = new GameScopeSpecified();
            room.components.addComponent(c);
            expect(room.components.subscribers.sensor.get(c.id)).to.exist;
            expect(room.components.subscribers.modifier.get(c.id)).to.exist;
            expect(room.components.subscribers.reacter.get(c.id)).to.exist;
          });
        });
      });
    });

    describe('As a game', () => {
      describe('Subscribes components at the appropriate scopes', () => {
        it('Subscribes at default scopes if none specified', () => {
          const c = new NoScopeSpecified();
          game.components.addComponent(c);
          expect(game.components.subscribers.sensor.get(c.id)).to.exist;
          expect(game.components.subscribers.modifier.get(c.id)).to.exist;
          expect(game.components.subscribers.reacter.get(c.id)).to.exist;
        });

        it('Subscribes to self for entity-scoped components', () => {
          const c = new EntityScopeSpecified();
          game.components.addComponent(c);
          expect(game.components.subscribers.sensor.get(c.id)).to.exist;
          expect(game.components.subscribers.modifier.get(c.id)).to.exist;
          expect(game.components.subscribers.reacter.get(c.id)).to.exist;
        });

        it('Subscribes to self for world-scoped components', () => {
          const c = new WorldScopeSpecified();
          game.components.addComponent(c);
          expect(game.components.subscribers.sensor.get(c.id)).to.exist;
          expect(game.components.subscribers.modifier.get(c.id)).to.exist;
          expect(game.components.subscribers.reacter.get(c.id)).to.exist;
        });

        it('Subscribes to game if scoped appropriately', () => {
          const c = new GameScopeSpecified();
          game.components.addComponent(c);
          expect(game.components.subscribers.sensor.get(c.id)).to.exist;
          expect(game.components.subscribers.modifier.get(c.id)).to.exist;
          expect(game.components.subscribers.reacter.get(c.id)).to.exist;
        });
      });
    });
  });


});
