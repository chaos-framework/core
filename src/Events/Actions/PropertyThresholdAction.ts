import { 
  Action, Entity, Component, ActionParameters, ActionType, BroadcastType, PropertyChangeAction,
} from '../../internal.js';

export class PropertyThresholdAction extends Action {
  actionType: ActionType = ActionType.PROPERTY_THRESHOLD_ACTION;
  broadcastType = BroadcastType.NONE;

  propertyName: string;
  newValue: number;
  previousValue: number;
  threshold: 'min' | 'max';
  thresholdValue: number;
  oldState: 'out' | 'in' | 'equals';
  newState: 'out' | 'in' | 'equals';

  adjustments: { amount: number, by?: Entity | Component }[] = [];
  multipliers: { amount: number, by?: Entity | Component }[] = [];

  constructor({ caster, target, threshold, newValue, previousValue, thresholdValue, propertyName, oldState, newState, using, metadata }: PropertyThresholdAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.propertyName = propertyName;
    this.newValue = newValue;
    this.previousValue = previousValue;
    this.threshold = threshold;
    this.thresholdValue = thresholdValue;
    this.oldState = oldState;
    this.newState = newState;
  }

  apply(): boolean {
    return true;
  }
}

// tslint:disable-next-line: no-namespace
export namespace PropertyThresholdAction {	
  export interface Params extends ActionParameters {
    target: Entity,
    propertyName: string,	
    newValue: number,
    previousValue: number,
    threshold: 'min' | 'max',
    thresholdValue: number,
    adjustmentAction?: PropertyChangeAction,
    oldState: 'out' | 'in' | 'equals',
    newState: 'out' | 'in' | 'equals'
  }

  export interface PropertyParams extends ActionParameters {
    target: Entity,
    previousValue: number,
    adjustmentAction?: PropertyChangeAction,
    oldState: 'out' | 'in' | 'equals'
  }
}
