import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";
import Component from '../../EntityComponent/Component';

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

export interface PropertyAdjustmentActionParameters extends ActionParameters {
  target: Entity,
  property: string, 
  amount: number,
}

export interface PropertyAdjustmentActionEntityParameters extends ActionParameters {
  property: string, 
  amount: number,
}
