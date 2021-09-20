import { 
  Action, ActionParameters, Entity, ActionType, BroadcastType, Chaos, Player, Team
} from '../../internal'; 

export class ChangeTurnAction extends Action {
  actionType: ActionType = ActionType.CHANGE_TURN_ACTION;
  broadcastType = BroadcastType.FULL;

  to: Entity | Player | Team | undefined;

  constructor({ caster,to, using, metadata }: ChangeTurnAction.Params) {
    super({caster, using, metadata });
    this.to = to;
  }

  apply(): boolean {
    if(Chaos.hasTurn === this.to) {
      return false;
    } else {
      Chaos.hasTurn = this.to;
      return true;
    }
  }

  serialize(): ChangeTurnAction.Serialized {
    let type: 'Entity' | 'Player' | 'Team' | 'undefined' = 'undefined';
    if (this.to instanceof Entity) {
      type = 'Entity';
    } else if (this.to instanceof Player) {
      type = 'Player';
    } else if (this.to instanceof Team) {
      type = 'Team';
    }
    return {
      ...super.serialize(),
      to: this.to?.id,
      type
    };
  };

  static deserialize(json: any): ChangeTurnAction {
    try {
      // Deserialize common fields
      const common = Action.deserializeCommonFields(json);
      // Deserialize unique fields
      let to;
      switch(json.type) {
        case 'Entity':
          to = Chaos.getEntity(json.to);
          break;
        case 'Player':
          to = Chaos.players.get(json.to);
          break;
        case 'Team':
          to = Chaos.teams.get(json.to);
          break;
      }
      // Build the action if we did indeed find
      return new ChangeTurnAction({ ...common, to });
    } catch (error) {
      throw error;
    }
  }
}

export namespace ChangeTurnAction {
  export interface EntityParams extends ActionParameters {
  }

  export interface Params extends EntityParams {
    to: Entity | Player | Team | undefined;
  }

  export interface Serialized extends Action.Serialized {
    to?: string,
    type: 'Entity' | 'Player' | 'Team' | 'undefined'
  }
}
