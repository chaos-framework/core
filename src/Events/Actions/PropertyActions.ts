import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";
import Component from '../../EntityComponent/Component';
import Value from '../../EntityComponent/Properties/Value';
import Property from '../../EntityComponent/Properties/Property';

export class PropertyAdditionAction extends Action {
  target: Entity;
  name: string;
  current: Value;
  min?: Value;
  max?: Value;

  constructor({ caster, target, name, current, min, max, using, tags }: PropertyAdditionActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
    this.current = current instanceof Value ? current : new Value(current);
    if(min) {
      this.min = min instanceof Value ? min : new Value(min);
    }
    if(max) {
      this.max = max instanceof Value ? max : new Value(max);
    }
  }

  apply(): boolean {
    return this.target._addProperty(name, new Property(this.current, this.min, this.max));
  }
}

export interface PropertyAdditionActionEntityParameters extends ActionParameters {
  name: string, 
  current: Value | number;
  min?: Value | number;
  max?: Value | number;
}
export interface PropertyAdditionActionParameters extends PropertyAdditionActionEntityParameters {
  target: Entity
}

export class PropertyRemovalAction extends Action {
  target: Entity;
  name: string;

  constructor({ caster, target, name, using, tags }: PropertyRemovalActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._removeProperty(name);
  }
}

export interface PropertyRemovalActionEntityParameters extends ActionParameters {
  name: string, 
}
export interface PropertyRemovalActionParameters extends PropertyRemovalActionEntityParameters {
  target: Entity
}


export class PropertyAdjustmentAction extends Action {
  property: string;
  amount: number;
  finalAmount: number;
  adjustments: { amount: number, by?: Entity | Component }[] = [];
  multipliers: { amount: number, by?: Entity | Component }[] = [];

  constructor({ caster, target, property, amount, using, tags }: PropertyAdjustmentActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.property = property;
    this.amount = amount;
    this.finalAmount = amount;
  }

  apply(): boolean {
    this.calculate();
    return true;
    // TODO figure out property adjustments
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
    return key === this.property;
  }

}

export interface PropertyAdjustmentActionEntityParameters extends ActionParameters {
  property: string, 
  amount: number,
}

export interface PropertyAdjustmentActionParameters extends PropertyAdjustmentActionEntityParameters {
  target: Entity,
}