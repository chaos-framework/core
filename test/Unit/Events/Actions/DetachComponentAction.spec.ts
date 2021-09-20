import { expect } from 'chai';
import 'mocha';

import { DetachComponentAction, Entity, Chaos, Component } from '../../../../src/internal';

import { EmptyComponent } from '../../../Mocks/Components/Functional';

describe('DetachComponentAction', () => {
  let entity: Entity;
  let component: EmptyComponent;

  beforeEach(() => {
    Chaos.reset();
    entity = new Entity({ name: "Test Entity" });
    component = new EmptyComponent();
    entity._attach(component);
  });

  it('Removes an ability from an entity upon execution', () => {
    const action = new DetachComponentAction({ target: entity, component });
    action.execute();
    expect(entity.has(component.name)).to.be.false;
  });
});