import { expect } from 'chai';
import 'mocha';

import { ForgetAbilityAction, Entity, Chaos } from '../../../../src/internal';

import EmptyAbility from '../../../Mocks/Abilities/Empty';

describe('ForgetAbilityAction Action', () => {
  let e: Entity;
  let ability: EmptyAbility;

  beforeEach(() => {
    Chaos.reset();
    e = new Entity({ name: "Test Entity" });
    ability = new EmptyAbility();
    e._learn(ability, undefined, undefined);
  });

  it('Removes an ability from an entity upon execution', () => {
    const action = new ForgetAbilityAction({caster: e, target: e, ability});
    expect(e.can(ability.name)).to.be.true;
    action.execute();
    expect(e.can(ability.name)).to.be.false;
  });
  
});