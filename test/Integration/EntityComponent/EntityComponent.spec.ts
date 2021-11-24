
import { expect } from 'chai';
import 'mocha';

import { Component, Entity, Chaos } from '../../../src/internal.js';
import { EmptyComponent } from '../../Mocks/Components/Functional';

describe('Entity-Component relationships', function () {
  this.beforeEach(function () {
    Chaos.reset;
  })

  it('Components can return thier parent Entity', function() {
    const entity = new Entity();
    const component = new EmptyComponent();
    entity._attach(component);
    expect(component.getParentEntity()).to.equal(entity);
  });
});