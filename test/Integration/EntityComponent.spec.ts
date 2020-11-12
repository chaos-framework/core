import { ok, equal } from 'assert';

import Entity from '../../src/EntityComponent/Entity';
import Component from '../../src/EntityComponent/Component';

import EmptyComponent from '../Mocks/Components/Empty';

describe('Components attaching to entities', () => {
  let e: Entity;

  beforeEach(() => {
    e = new Entity();
  });

  it('Can attach to entities', () => {
    // Attach an empty component
    const component = new EmptyComponent();
    const attached: boolean = e._attach(component);
    ok(attached, 'Could not attach basic component to entity.');
    ok(e.is('Empty Component'), 'Did not find attached component on entity.');
  });
  
});