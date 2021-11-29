import { expect } from 'chai';
import 'mocha';

import { AttachComponentAction, Entity, Chaos, ActionType, Vector, Component } from '../../../../src/internal.js';

import { EmptyComponent } from '../../../Mocks/Components/Functional.js';
import Room from '../../../Mocks/Worlds/Room.js';

describe('AttachComponentAction', () => {
  let target: Entity;
  let component: EmptyComponent;
  const world = new Room();

  beforeEach(() => {
    Chaos.reset();
    target = new Entity({ name: "Test Entity" });
    target._publish(world, new Vector(0, 0));
    component = new EmptyComponent();
  });

  afterEach(() => {
    target.unpublish();
  })

  it('Attaches a component to an entity upon execution', () => {
    const action = new AttachComponentAction({ target, component });
    action.execute();
    expect(target.has(component.name)).to.be.true;
  });

  
  it('Serializes to a proper object', () => {
    const action = new AttachComponentAction({ target, component });
    const o = action.serialize();
    expect(o.target).to.equal(target.id);
    expect(o.component.id).to.equal(component.id)
  });

  it('Can deserialize from proper json', () => {
    const json: AttachComponentAction.Serialized = { target: target.id, component: component.serializeForClient(), permitted: true, actionType: ActionType.ATTACH_COMPONENT_ACTION };
    const a = AttachComponentAction.deserialize(json);
    expect(a instanceof AttachComponentAction).to.be.true;
    expect(a.target).to.equal(target);
    expect(a.component.id).to.equal(component.id);
    expect(a.component.name).to.equal(component.name);
  });
});
