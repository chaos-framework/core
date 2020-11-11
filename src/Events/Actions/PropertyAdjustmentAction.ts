import Action from '../Action';
import Entity from "../../EntityComponent/Entity";
import Component from '../../EntityComponent/Component';

export default class PropertyAdjustmentAction extends Action {
  property: string;
  amount: number;
  finalAmount: number;
  adjustments: number[] = [];
  multipliers: number[] = [];

  constructor(
    {caster, target, property, amount, using, tags}: 
    {caster: Entity, target: Entity, property: string, 
     amount: number, using?: Entity | Component, tags?: string[]}
  ) {
    super(caster, using, tags);
    this.target = target;
    this.property = property;
    this.amount = amount;
    this.finalAmount = amount;
  }

  apply() {
    this.adjustments.map(amount => this.finalAmount += amount);
    this.multipliers.map(amount => this.finalAmount *= amount);
    // TODO figure out property adjustments
  }

  adjust(amount: number, breadcrumbs?: string[], unique?: boolean) {
    // TODO this logic should be lifted up into Action itself
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.adjustments.push(amount);
  }

  multiply(amount: number, breadcrumbs?: string[], unique?: boolean) {
    if(breadcrumbs) {
      // If unique, make sure we haven't already applied an adjustment with any of these tags
      if(unique && breadcrumbs.some(r => this.breadcrumbs.has(r))) {
        return;
      }
      breadcrumbs.map(s => this.breadcrumbs.add(s));
    }
    this.multipliers.push(amount);
  }

  effects(key: string): boolean {
    return key === this.property;
  }

}