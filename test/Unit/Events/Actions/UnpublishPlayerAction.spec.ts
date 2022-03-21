import { expect } from 'chai';
import 'mocha';

import { Chaos, ActionType, Player, UnpublishPlayerAction } from '../../../../src/internal.js';

describe('UnpublishPlayerAction', () => {
  let target: Player;

  beforeEach(() => {
    Chaos.reset();
    target = new Player();
    target._publish();
  });

  it('Unpublishes the player', () => {
    const a = new UnpublishPlayerAction({ target });
    a.apply().next();
    expect(target.published).to.be.false;
  });

  it('Serializes to a proper object', () => {
    const a = new UnpublishPlayerAction({ target });
    const o = a.serialize();
    expect(o.target).to.equal(target.id);
  });

  it('Can deserialize from proper json', () => {
    const json: UnpublishPlayerAction.Serialized = {
      target: target.id,
      permitted: true,
      actionType: ActionType.UNPUBLISH_ENTITY_ACTION
    };
    const a = UnpublishPlayerAction.deserialize(json);
    expect(a instanceof UnpublishPlayerAction).to.be.true;
    expect(a.target.id).to.equal(target.id);
    expect(a.permitted).to.be.true;
  });
});
