import { 
  Action, Entity, Component, Value, ActionParameters, ActionType, BroadcastType,
  TerminalMessage, 
  Property,
  ValueType} from '../../internal.js';

export class PropertyChangeAction extends Action {
  actionType: ActionType = ActionType.PROPERTY_CHANGE_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  successVerb?: string;
  failureVerb?: string;

  target: Entity;
  property: Property;
  type: 'adjust' | 'set';
  value: ValueType;
  amount: number;
  finalAmount: number;
  previousValue: number;
  adjustments: { amount: number, by?: Entity | Component }[] = [];
  multipliers: { amount: number, by?: Entity | Component }[] = [];

  constructor({ caster, target, property, type = 'adjust', value = 'current', amount, using, metadata }: PropertyChangeAction.Params) {
    super({caster, using, metadata });
    this.target = target;
    this.property = property;
    this.previousValue = property[value].calculated;
    this.type = type;
    this.value = value;
    this.amount = amount;
    this.finalAmount = amount;
  }

  apply(): boolean {
    this.calculate();
    const { target, property, type, finalAmount } = this;
    // Figure out which value we're adjusting (current, min, or max)
    let v: Value;
    switch(this.value) {
      case 'min':
        v = property.min;
        break;
      case 'max':
        v = property.max;
        break;
      default:
        v = property.current;
        break;
    }
    // TODO make sure we didn't break a min/max order rule, ie trying to set max below min should totally fail action
    // Either adjust or set this number
    const delta = type === 'adjust' ? v._adjust(finalAmount) : v._set(finalAmount);
    // Update threshold state if either threshold was newly crossed
    const oldMinState = property.minState;
    const newMinState = property.updateMinState();
    if (newMinState !== undefined) {
      const { caster, target, using, previousValue } = this;
      property.getMinThresholdAction({ caster, target, using, previousValue, oldState: oldMinState })
    }
    const oldMaxState = property.maxState;
    const newMaxState = property.updateMaxState();
    if (newMaxState !== undefined) {
      const { caster, target, using, previousValue } = this;
      property.getMaxThresholdAction({ caster, target, using, previousValue, oldState: oldMaxState })
    }
    return true;
  }

  calculate(): number { 
    this.adjustments.map(adjustment => this.finalAmount += adjustment.amount);
    this.multipliers.map(multiplier => this.finalAmount *= multiplier.amount);
    return this.finalAmount;
  }

  adjust(amount: number, by?: Entity | Component, breadcrumbs?: string[], unique?: boolean) {
    // TODO this logic should be lifted up into Action itself
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.adjustments.push({ amount, by });
  }

  multiply(amount: number, by?: Entity | Component, breadcrumbs?: string[], unique?: boolean) {
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.multipliers.push({ amount, by });
  }

  effects(key: string): boolean {
    return key === this.property.name;
  }

  increases(key: string): boolean {
    return this.effects(key)&& this.amount > 0;
  }

  decreases(key: string): boolean {
    return this.effects(key) && this.amount < 0;
  }

  buffs(key: string): boolean {
    return this.effects(key)&& this.amount > 0;
  }

  damages(key: string): boolean {
    return this.effects(key) && this.amount < 0;
  }

  printedWithVerbs(success: string, failure?: string): PropertyChangeAction {
    this.successVerb = success;
    this.failureVerb = failure;
    return this;
  }

  generateMessage() {
    if(this.successVerb !== undefined) {
      this.terminalMessage = new TerminalMessage(
        this.caster,
        this.successVerb,
        this.target,
        '--',
        this.finalAmount.toString(),
        this.property.name
      )
    }
  }
}

// tslint:disable-next-line: no-namespace
export namespace PropertyChangeAction {	
  export interface ValueParams extends ActionParameters {	
    amount: number,	
  }	

  export interface Params extends ValueParams {	
    target: Entity,	
    property: Property,	
    value?: 'current' | 'min' | 'max',	
    type?: 'adjust' | 'set'	
  }	
}
