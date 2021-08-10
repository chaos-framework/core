import { 
  Action, ActionParameters, Entity, ActionType, BroadcastType
} from '../../internal'; 

export class RemovePropertyAction extends Action {
  actionType: ActionType = ActionType.REMOVE_PROPERTY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  target: Entity;
  name: string;

  constructor({ caster, target, name, using, metadata }: RemovePropertyAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._removeProperty(this.name);
  }
}

export namespace RemovePropertyAction { 
  export interface EntityParams extends ActionParameters {
    name: string, 
  }
  export interface Params extends EntityParams {
    target: Entity
  }
}