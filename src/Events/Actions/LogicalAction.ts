import {
  Entity,
  Action,
  ActionParameters,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator,
  ComponentContainer
} from '../../internal.js';

export class LogicalAction extends Action<ComponentContainer> {
  actionType: ActionType = ActionType.LOGICAL;
  broadcastType = BroadcastType.NONE;

  target?: ComponentContainer;

  constructor(
    public name: string,
    public payload: any = {},
    { caster, target, using, metadata }: LogicalAction.Params = {}
  ) {
    super({ caster, using, metadata });
    this.target = target;
  }

  *apply(): ProcessEffectGenerator {
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace LogicalAction {
  export interface Params extends ActionParameters {
    target?: Entity;
  }
}
