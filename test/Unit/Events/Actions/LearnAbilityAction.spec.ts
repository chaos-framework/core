import { expect } from 'chai';
import 'mocha';

import { LearnAbilityAction, Entity, Chaos } from '../../../../src/internal';

import EmptyAbility from '../../../Mocks/Abilities/Empty';

describe('LearnAbilityAction Action', () => {
  let e: Entity;
  let ability: EmptyAbility;

  beforeEach(() => {
    Chaos.reset();
    e = new Entity({ name: "Test Entity" });
    ability = new EmptyAbility();
  });

  it('Grants an ability to an entity upon execution', () => {
    const action = new LearnAbilityAction({caster: e, target: e, ability});
    expect(e.can(ability.name)).to.be.false;
    action.execute();
    expect(e.can(ability.name)).to.be.true;
  });
  
});