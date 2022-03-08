import {
  Entity,
  Action,
  ActionParameters,
  ActionType,
  BroadcastType,
  ProcessEffectGenerator
} from '../../internal.js';

export class LogicalAction extends Action {
  actionType: ActionType = ActionType.LOGICAL;
  broadcastType = BroadcastType.NONE;

  target?: Entity;

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
