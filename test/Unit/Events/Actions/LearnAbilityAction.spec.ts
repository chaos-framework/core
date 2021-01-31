import { expect } from 'chai';
import 'mocha';

import { LearnAbilityAction, Entity, Game } from '../../../../src/internal';

import EmptyAbility from '../../../Mocks/Abilities/Empty';
import EmptyGame from '../../../Mocks/Games/EmptyGame';

describe('LearnAbilityAction Action', () => {
  let e: Entity;
  let ability: EmptyAbility;
  let game: Game;

  beforeEach(() => {
    game = new EmptyGame({});
    e = new Entity();
    ability = new EmptyAbility();
  });

  it('Grants an ability to an entity upon execution', () => {
    const action = new LearnAbilityAction({caster: e, target: e, ability});
    expect(e.can(ability.name)).to.be.false;
    action.execute();
    expect(e.can(ability.name)).to.be.true;
  });
  
});