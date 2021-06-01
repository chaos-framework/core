import { Game, Player, Action, ActionParameters, Entity, MessageType } from '../../internal';

export class OwnEntityAction extends Action {
  messageType = MessageType.PUBLISH_PLAYER_ACTION;

  player: Player;
  entity: Entity;

  constructor({ caster, target, entity, player, using, tags }: OwnEntityAction.Params) {
    super({caster, using, tags});
    this.player = player;
    this.entity = entity;
  }

  apply(): boolean {
    if(this.player.entities.has(this.entity.id)) {
      return false; // player already owns this entity
    }
    this.visibilityChanges = { type: "addition", changes: this.player._ownEntity(this.entity) };
    return true;
  }

  serialize(): OwnEntityAction.Serialized {
    return {
      ...super.serialize(),
      player: this.player.id,
      entity: this.entity.id
    }
  }

  deserialize(json: OwnEntityAction.Serialized): OwnEntityAction {
    const game = Game.getInstance();
    const player = game.players.get(json.player);
    if(player === undefined) {
      throw new Error(`Player ${json.player} not found for this OwnEntityAction`);
    }
    const entity = game.getEntity(json.entity);
    if(entity === undefined) {
      throw new Error(`Entity ${json.entity} not found for this OwnEntityAction`);
    }
    return new OwnEntityAction({player, entity})
  }

}

// tslint:disable-next-line: no-namespace
export namespace OwnEntityAction {
  export interface PlayerParams extends ActionParameters {
    entity: Entity,
  }

  export interface Params extends PlayerParams {
    player: Player,
    target?: Entity
  }

  export interface Serialized extends Action.Serialized {
    player: string;
    entity: string;
  }
}
