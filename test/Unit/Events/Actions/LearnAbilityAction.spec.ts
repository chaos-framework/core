import { expect } from 'chai';
import 'mocha';

import { LearnAbilityAction, Entity, Chaos } from '../../../../src/internal.js';

import EmptyAbility from '../../../Mocks/Abilities/Empty.js';

describe('LearnAbilityAction Action', () => {
  let e: Entity;
  let ability: EmptyAbility;

  beforeEach(() => {
    Chaos.reset();
    e = new Entity({ name: 'Test Entity' });
    ability = new EmptyAbility();
  });

  it('Grants an ability to an entity upon execution', () => {
    const action = new LearnAbilityAction({ caster: e, target: e, ability });
    expect(e.can(ability.name)).to.be.false;
    action.runPrivate();
    expect(e.can(ability.name)).to.be.true;
  });
});
