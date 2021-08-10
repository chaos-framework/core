import { Entity, Component, Action, ActionParameters, ActionType, BroadcastType } from '../../internal';

export class CustomAction extends Action {
  actionType: ActionType = ActionType.INVALID;
  broadcastType = BroadcastType.NONE;

  target?: Entity;

  constructor(public name = '', public payload: any = {}, { caster, target, using, metadata }: CustomAction.Params = {}) {
    super({ caster, using, metadata });
    this.target = target;
  }

  apply(): boolean {
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace CustomAction {
  export interface Params extends ActionParameters {
    target?: Entity;
  }
}
