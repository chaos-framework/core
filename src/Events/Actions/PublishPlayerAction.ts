import { Game } from '../../Game/Game';
import { Player } from '../../Game/Player';
import { Action, ActionParameters, Entity, MessageType } from '../../internal';

export class PublishPlayerAction extends Action {
  messageType = MessageType.PUBLISH_PLAYER_ACTION;

  player: Player;

  constructor({player}: PublishPlayerAction.Params) {
    super({});
    this.player = player;
  }

  apply(): boolean {
    Game.getInstance().players.set(this.player.id, this.player);
    return true;
  }

  serialize() {
    return {
        ...super.serialize(),
        player: this.player.serializeForClient()
      };
  }

  static deserialize(json: Player.SerializedForClient): PublishPlayerAction {
    return new PublishPlayerAction({player: Player.DeserializeAsClient(json)})
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
