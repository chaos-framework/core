import { expect } from 'chai';
import 'mocha';

import Entity from '../../../src/EntityComponent/Entity';

import { EmptyComponent } from '../../Mocks/Components/Functional';
import { Humanoid } from '../../Mocks/Components/Traits';
import { Paladin } from '../../Mocks/Components/Classes';
import { Game } from '../../../src';
import EmptyGame from '../../Mocks/Games/EmptyGame';

describe('Components attaching to entities', () => {
  let e: Entity;
  let game: Game;

  beforeEach(() => {
    game = new EmptyGame({});
    e = new Entity();
  });

  it('Can attach to entities', () => {
    // Attach an empty component
    const component = new EmptyComponent();
    let success: boolean = e._attach(component);
    expect(success).to.be.true;
    expect(e.is(component.name)).to.exist;
  });

  it('Can add slots to an entity', () => {
    expect(e.attach({component: new Humanoid()}).execute()).to.be.true;
    expect(e.slots.has('Head')).to.be.true;
    expect(e.slots.has('Neck')).to.be.true;
    expect(e.slots.has('Torso')).to.be.true;
    expect(e.slots.has('Tail')).to.not.be.true;
  });

  it('Can add abilities to an entity', () => {
    expect(e.attach({component: new Paladin()}).execute()).to.be.true;
    expect(e.can('Heal')).to.be.true;
    expect(e.can('Something Random 12345')).to.be.false;
  });
  
});