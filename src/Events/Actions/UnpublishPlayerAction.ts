import { Action, Chaos, ActionType, Player, ProcessEffectGenerator } from '../../internal.js';

export class UnpublishPlayerAction extends Action<Player> {
  actionType = ActionType.UNPUBLISH_PLAYER_ACTION;

  target: Player;

  constructor({ target }: UnpublishPlayerAction.Params) {
    super();
    this.target = target;
  }

  *apply(): ProcessEffectGenerator {
    return this.target._unpublish() || false;
  }

  serialize() {
    return {
      ...super.serialize(),
      target: this.target.id
    };
  }

  static deserialize(json: UnpublishPlayerAction.Serialized): UnpublishPlayerAction {
    const common = Action.deserializeCommonFields(json);
    const target = Chaos.players.get(json.target);
    if (target === undefined) {
      throw new Error('Player not found!');
    }
    return new UnpublishPlayerAction({ ...common, target });
  }
}

// tslint:disable-next-line: no-namespace
export namespace UnpublishPlayerAction {
  export interface Params {
    target: Player;
  }

  export interface Serialized extends Action.Serialized {
    target: string;
  }
}
