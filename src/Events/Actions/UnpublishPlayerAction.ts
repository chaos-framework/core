import {
  Action,
  Chaos,
  ActionType,
  Player,
  ActionEffectGenerator
} from '../../internal.js'

export class UnpublishPlayerAction extends Action {
  actionType = ActionType.UNPUBLISH_PLAYER_ACTION

  player: Player

  constructor({ player }: UnpublishPlayerAction.Params) {
    super()
    this.player = player
  }

  *apply(): ActionEffectGenerator {
    return this.player._unpublish()
  }

  serialize() {
    return {
      ...super.serialize(),
      player: this.player.id
    }
  }

  static deserialize(
    json: UnpublishPlayerAction.Serialized
  ): UnpublishPlayerAction {
    const common = Action.deserializeCommonFields(json)
    const player = Chaos.players.get(json.player)
    if (player === undefined) {
      throw new Error('Player not found!')
    }
    return new UnpublishPlayerAction({ ...common, player })
  }
}

// tslint:disable-next-line: no-namespace
export namespace UnpublishPlayerAction {
  export interface Params {
    player: Player
  }

  export interface Serialized extends Action.Serialized {
    player: string
  }
}
