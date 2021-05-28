import { 
  Action, ActionParameters, Entity, MessageType
} from '../../internal'; 

export class RemovePropertyAction extends Action {
  messageType: MessageType = MessageType.REMOVE_PROPERTY_ACTION;

  target: Entity;
  name: string;

  constructor({ caster, target, name, using, tags }: RemovePropertyAction.Params) {
    super({caster, using, tags});
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