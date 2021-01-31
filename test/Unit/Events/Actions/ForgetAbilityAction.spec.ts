import { expect } from 'chai';
import 'mocha';

import { ForgetAbilityAction, Entity, Game } from '../../../../src/internal';

import EmptyAbility from '../../../Mocks/Abilities/Empty';
import EmptyGame from '../../../Mocks/Games/EmptyGame';

describe('ForgetAbilityAction Action', () => {
  let e: Entity;
  let ability: EmptyAbility;
  let game: Game;

  beforeEach(() => {
    game = new EmptyGame({});
    e = new Entity();
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