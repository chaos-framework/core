import { expect } from 'chai';
import 'mocha';

import { Component, Entity, Chaos, World, Vector } from '../../src/internal.js';
import { EmptyComponent } from '../Mocks/Components/Functional.js';
import Room from '../Mocks/Worlds/Room.js';

describe('Publishing and unpublishing entities and their components', function () {
  let entity: Entity;
  let component: Component;
  let world: Room;
  const origin = new Vector(0, 0);

  beforeEach(function () {
    Chaos.reset();
    entity = new Entity;
    component = new EmptyComponent;
    world = new Room;
  });
  
  it('Does not track unpublished entities or their components', function () {
    expect(Chaos.entities.has(entity.id)).to.be.false;
    expect(Chaos.allComponents.has(component.id)).to.be.false;
  });

  it('Tracks entities with attached components', function() {
    entity._attach(component);
    entity._publish(world, origin);
    expect(Chaos.entities.has(entity.id)).to.be.true;
    expect(Chaos.allComponents.has(component.id)).to.be.true;
  });

  it('Tracks components attached after publishing', function() {
    entity._publish(world, origin);
    entity._attach(component);
    expect(Chaos.allComponents.has(component.id)).to.be.true;
  });

  it('Does not track entities or components attached to an entity that gets unpublished', function () {
    entity._attach(component);
    entity._publish(world, origin);
    entity._unpublish();
    expect(Chaos.entities.has(entity.id)).to.be.false;
    expect(Chaos.allComponents.has(component.id)).to.be.false;
  });

  it('Does not track components that get detached', function () {
    entity._attach(component);
    entity._publish(world, origin);
    component._detach();
    expect(Chaos.entities.has(entity.id)).to.be.true;
    expect(Chaos.allComponents.has(component.id)).to.be.false;
  });

  

});

describe('Publishing and unpublishing worlds and their entities', function () {
  let entity: Entity;
  let component: Component;

  beforeEach(function () {
    Chaos.reset();
  });

});