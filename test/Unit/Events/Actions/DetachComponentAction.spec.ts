import { expect } from 'chai';
import 'mocha';

import {
  DetachComponentAction,
  Entity,
  Chaos,
  Component,
  ActionType,
  Vector
} from '../../../../src/internal.js';

import { EmptyComponent } from '../../../Mocks/Components/Functional.js';
import Room from '../../../Mocks/Worlds/Room.js';

describe('DetachComponentAction', () => {
  let target: Entity;
  let component: EmptyComponent;
  const world = new Room();

  beforeEach(() => {
    Chaos.reset();
    target = new Entity({ name: 'Test Entity' });
    target._publish(world, new Vector(0, 0));
    component = new EmptyComponent();
    target._attach(component);
  });

  afterEach(() => {
    target.unpublish();
  });

  it('Removes a component from an entity upon execution', () => {
    const action = new DetachComponentAction({ target, component });
    action.runPrivate();
    expect(target.has(component.name)).to.be.false;
  });

  it('Serializes to a proper object', () => {
    const action = new DetachComponentAction({ target, component });
    const o = action.serialize();
    expect(o.target).to.equal(target.id);
    expect(o.component).to.equal(component.id);
  });

  it('Can deserialize from proper json', () => {
    const json: DetachComponentAction.Serialized = {
      target: target.id,
      component: component.id,
      permitted: true,
      actionType: ActionType.DETACH_COMPONENT_ACTION
    };
    const a = DetachComponentAction.deserialize(json);
    expect(a instanceof DetachComponentAction).to.be.true;
    expect(a.target).to.equal(target);
    expect(a.component).to.equal(component);
  });
});
