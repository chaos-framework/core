import {
  Chaos,
  Player,
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  NestedSetChanges,
  NestedSet,
  NestedChanges,
  ProcessEffectGenerator
} from '../../internal.js';

export class OwnEntityAction extends Action {
  actionType = ActionType.OWN_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;
  player: Player;
  entity: Entity;

  chunkVisibilityChanges = new NestedSetChanges();
  entityVisibilityChanges = new NestedChanges();

  constructor({ caster, target, entity, player, using, metadata }: OwnEntityAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.player = player;
    this.entity = entity;
  }

  *apply(): ProcessEffectGenerator {
    if (this.player.entities.has(this.entity.id)) {
      return false; // player already owns this entity
    }
    const result = this.player._ownEntity(
      this.entity,
      this.chunkVisibilityChanges,
      this.entityVisibilityChanges
    );
    return result;
  }

  serialize(): OwnEntityAction.Serialized {
    return {
      ...super.serialize(),
      player: this.player.id,
      entity: this.entity.id
    };
  }

  static deserialize(json: OwnEntityAction.Serialized): OwnEntityAction {
    const player = Chaos.players.get(json.player);
    if (player === undefined) {
      throw new Error(`Player ${json.player} not found for this OwnEntityAction`);
    }
    const entity = Chaos.getEntity(json.entity);
    if (entity === undefined) {
      throw new Error(`Entity ${json.entity} not found for this OwnEntityAction`);
    }
    return new OwnEntityAction({ player, entity });
  }
}

// tslint:disable-next-line: no-namespace
export namespace OwnEntityAction {
  export interface PlayerParams extends ActionParameters {
    entity: Entity;
  }

  export interface Params extends PlayerParams {
    player: Player;
    target?: Entity;
  }

  export interface Serialized extends Action.Serialized {
    player: string;
    entity: string;
  }
}
