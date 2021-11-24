import { Action, Chaos, ActionType, Player } from '../../internal.js';

export class PublishPlayerAction extends Action {
  actionType = ActionType.PUBLISH_PLAYER_ACTION;

  player: Player;

  constructor({player}: PublishPlayerAction.Params) {
    super({});
    this.player = player;
  }

  apply(): boolean {
    return this.player._publish();
  }

  serialize() {
    return {
        ...super.serialize(),
        player: this.player.serializeForClient()
      };
  }

  static deserialize(json: PublishPlayerAction.Serialized): PublishPlayerAction {
    return new PublishPlayerAction({player: Player.DeserializeAsClient(json.player)})
  }
}

// tslint:disable-next-line: no-namespace
export namespace PublishPlayerAction {
  export interface Params {
    player: Player;
  }

  export interface Serialized extends Action.Serialized {
    player: Player.SerializedForClient;
  }
}
