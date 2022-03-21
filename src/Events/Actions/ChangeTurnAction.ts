import {
  Action,
  ActionParameters,
  Entity,
  ActionType,
  BroadcastType,
  Chaos,
  Player,
  Team,
  ProcessEffectGenerator
} from '../../internal.js';

export class ChangeTurnAction extends Action<Entity | Player | Team> {
  actionType: ActionType = ActionType.CHANGE_TURN_ACTION;
  broadcastType = BroadcastType.FULL;

  target: Entity | Player | Team | undefined;
  appliedAt?: number;

  constructor({ caster, target, using, metadata }: ChangeTurnAction.Params) {
    super({ caster, using, metadata });
    this.target = target;
  }

  async *apply(): ProcessEffectGenerator {
    this.appliedAt = Date.now();
    if (Chaos.currentTurn === this.target) {
      return false;
    } else {
      Chaos.setCurrentTurn(this.target);
      Chaos.setCurrentTurnSetAt(this.appliedAt);
      return true;
    }
  }

  serialize(): ChangeTurnAction.Serialized {
    let type: 'Entity' | 'Player' | 'Team' | 'undefined' = 'undefined';
    if (this.target instanceof Entity) {
      type = 'Entity';
    } else if (this.target instanceof Player) {
      type = 'Player';
    } else if (this.target instanceof Team) {
      type = 'Team';
    }
    return {
      ...super.serialize(),
      target: this.target?.id,
      type
    };
  }

  static deserialize(json: any): ChangeTurnAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      let target;
      switch (json.type) {
        case 'Entity':
          target = Chaos.getEntity(json.target);
          break;
        case 'Player':
          target = Chaos.players.get(json.target);
          break;
        case 'Team':
          target = Chaos.teams.get(json.target);
          break;
      }
      // Build the action if we did indeed find
      return new ChangeTurnAction({ ...common, target });
    } catch (error) {
      throw error;
    }
  }
}

export namespace ChangeTurnAction {
  export interface Params extends ActionParameters<Entity | Player | Team> {
    target: Entity | Player | Team | undefined;
  }

  export interface Serialized extends Action.Serialized {
    target?: string;
    type: 'Entity' | 'Player' | 'Team' | 'undefined';
  }
}
