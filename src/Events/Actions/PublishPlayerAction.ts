import { Action, Chaos, ActionType, Player, ProcessEffectGenerator } from '../../internal.js';

export class PublishPlayerAction extends Action<Player> {
  actionType = ActionType.PUBLISH_PLAYER_ACTION;

  target: Player;

  constructor({ target }: PublishPlayerAction.Params) {
    super({});
    this.target = target;
  }

  *apply(): ProcessEffectGenerator {
    return this.target._publish();
  }

  serialize() {
    return {
      ...super.serialize(),
      player: this.target.serializeForClient()
    };
  }

  static deserialize(json: PublishPlayerAction.Serialized): PublishPlayerAction {
    return new PublishPlayerAction({
      target: Player.DeserializeAsClient(json.target)
    });
  }
}

// tslint:disable-next-line: no-namespace
export namespace PublishPlayerAction {
  export interface Params {
    target: Player;
  }

  export interface Serialized extends Action.Serialized {
    target: Player.SerializedForClient;
  }
}
