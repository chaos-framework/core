import { expect } from 'chai';
import 'mocha';

import { GrantAbility, DenyAbility } from '../../../src/Events/Actions/AbilityActions';
import EmptyAbility from '../../Mocks/Abilities/Empty';

import Entity from '../../../src/EntityComponent/Entity';
import { Game } from '../../../src';
import EmptyGame from '../../Mocks/Games/EmptyGame';

describe('GrantAbility Action', () => {
  let e: Entity;
  let ability: EmptyAbility;
  let game: Game;

  beforeEach(() => {
    game = new EmptyGame();
    e = new Entity();
    ability = new EmptyAbility();
  });

  it('Grants an ability to an entity upon execution', () => {
    const action = new GrantAbility({caster: e, target: e, ability});
    expect(e.can(ability.name)).to.be.false;
    action.execute();
    expect(e.can(ability.name)).to.be.true;
  });
  
});

describe('DenyAbility Action', () => {
  let e: Entity;
  let ability: EmptyAbility;
  let game: Game;

  beforeEach(() => {
    game = new EmptyGame();
    e = new Entity();
    ability = new EmptyAbility();
    e._grant(ability, undefined, undefined);
  });

  it('Removes an ability from an entity upon execution', () => {
    const action = new DenyAbility({caster: e, target: e, ability});
    expect(e.can(ability.name)).to.be.true;
    action.execute();
    expect(e.can(ability.name)).to.be.false;
  });
  
});