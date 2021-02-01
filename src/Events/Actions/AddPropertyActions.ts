import { 
  Action, ActionParameters, IEntity
} from '../../internal'; 

export class AddPropertyAction extends Action {
  target: IEntity;
  name: string;
  current: number;
  min?: number;
  max?: number;

  constructor({ caster, target, name, current, min, max, using, tags }: AddPropertyAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
    this.current = current;
    this.min = min;
    this.max = max;
  }

  apply(): boolean {
    return this.target._addProperty(this.name, this.current, this.min, this.max);
  }
}

export namespace AddPropertyAction {
  export interface EntityParams extends ActionParameters {
    name: string, 
    current: number;
    min?: number;
    max?: number;
  }
  
  export interface Params extends EntityParams {
    target: IEntity
  }
}