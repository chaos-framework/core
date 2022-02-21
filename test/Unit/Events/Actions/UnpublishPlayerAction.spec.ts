import { expect } from 'chai';
import 'mocha';

import { Chaos, ActionType, Player, UnpublishPlayerAction } from '../../../../src/internal.js';

describe('UnpublishPlayerAction', () => {
  let player: Player;

  beforeEach(() => {
    Chaos.reset();
    player = new Player();
    player._publish();
  });

  it('Unpublishes the player', () => {
    const a = new UnpublishPlayerAction({ player });
    a.apply().next();
    expect(player.published).to.be.false;
  });

  it('Serializes to a proper object', () => {
    const a = new UnpublishPlayerAction({ player });
    const o = a.serialize();
    expect(o.player).to.equal(player.id);
  });

  it('Can deserialize from proper json', () => {
    const json: UnpublishPlayerAction.Serialized = {
      player: player.id,
      permitted: true,
      actionType: ActionType.UNPUBLISH_ENTITY_ACTION
    };
    const a = UnpublishPlayerAction.deserialize(json);
    expect(a instanceof UnpublishPlayerAction).to.be.true;
    expect(a.player.id).to.equal(player.id);
    expect(a.permitted).to.be.true;
  });
});
