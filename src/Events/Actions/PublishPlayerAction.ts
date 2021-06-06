import { Game } from '../../Game/Game';
import { Player } from '../../Game/Player';
import { Action, ActionParameters, Entity, ActionType } from '../../internal';

export class PublishPlayerAction extends Action {
  actionType = ActionType.PUBLISH_PLAYER_ACTION;

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
