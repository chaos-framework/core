import {
  Chaos,
  Player,
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  NestedSetChanges,
  NestedChanges,
  ProcessEffectGenerator
} from '../../internal.js';

export class OwnEntityAction extends Action<Player> {
  actionType = ActionType.OWN_ENTITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;
  target: Player;
  entity: Entity;

  chunkVisibilityChanges = new NestedSetChanges();
  entityVisibilityChanges = new NestedChanges();

  constructor({ caster, target, entity, using, metadata }: OwnEntityAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
    this.entity = entity;
  }

  *apply(): ProcessEffectGenerator {
    if (this.target.entities.has(this.entity.id)) {
      return false; // player already owns this entity
    }
    const result = this.target._ownEntity(
      this.entity,
      this.chunkVisibilityChanges,
      this.entityVisibilityChanges
    );
    return result;
  }

  serialize(): OwnEntityAction.Serialized {
    return {
      ...super.serialize(),
      target: this.target.id,
      entity: this.entity.id
    };
  }

  static deserialize(json: OwnEntityAction.Serialized): OwnEntityAction {
    const target = Chaos.players.get(json.target);
    if (target === undefined) {
      throw new Error(`Player ${json.target} not found for this OwnEntityAction`);
    }
    const entity = Chaos.getEntity(json.entity);
    if (entity === undefined) {
      throw new Error(`Entity ${json.entity} not found for this OwnEntityAction`);
    }
    return new OwnEntityAction({ target, entity });
  }
}

// tslint:disable-next-line: no-namespace
export namespace OwnEntityAction {
  export interface PlayerParams extends ActionParameters<Player> {
    entity: Entity;
  }

  export interface Params extends PlayerParams {
    target: Player;
  }

  export interface Serialized extends Action.Serialized {
    target: string;
    entity: string;
  }
}
