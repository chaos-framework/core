import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";
import Component from '../../EntityComponent/Component';
import { ValueType } from '../../EntityComponent/Properties/Property';
import Value from '../../EntityComponent/Properties/Value';

export class PropertyAdditionAction extends Action {
  target: Entity;
  name: string;
  current: number;
  min?: number;
  max?: number;

  constructor({ caster, target, name, current, min, max, using, tags }: PropertyAdditionActionParameters) {
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

export interface PropertyAdditionActionEntityParameters extends ActionParameters {
  name: string, 
  current: number;
  min?: number;
  max?: number;
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
    return this.target._removeProperty(this.name);
  }
}

export interface PropertyRemovalActionEntityParameters extends ActionParameters {
  name: string, 
}
export interface PropertyRemovalActionParameters extends PropertyRemovalActionEntityParameters {
  target: Entity
}

export enum PropertyChangeType { Adjust, Set }

export class PropertyChangeAction extends Action {
  property: string;
  type: PropertyChangeType;
  value: ValueType;
  amount: number;
  finalAmount: number;
  adjustments: { amount: number, by?: Entity | Component }[] = [];
  multipliers: { amount: number, by?: Entity | Component }[] = [];

  constructor({ caster, target, property, type = PropertyChangeType.Adjust, value = ValueType.Current, amount, using, tags }: PropertyChangeActionParameters) {
    super({caster, using, tags});
    this.target = target;
    this.property = property;
    this.type = type;
    this.value = value;
    this.amount = amount;
    this.finalAmount = amount;
  }

  apply(): boolean {
    this.calculate();
    const { target, property, type, finalAmount } = this;
    const p = this.target?.properties.get(property);
    // See if we have this property
    if(p) {
      // Figure out which value we're adjusting (current, min, or max)
      let v: Value;
      switch(this.value) {
        case ValueType.Min:
          v = p.min;
          break;
        case ValueType.Max:
          v = p.max;
          break;
        default:
          v = p.current;
          break;
      }
      // Either adjust or set this number
      type === PropertyChangeType.Adjust ? v._adjust(finalAmount) : v._set(finalAmount);
      return true;
    }
    return false;
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

export interface PropertyChangeActionValueParameters extends ActionParameters {
  amount: number,
}

export interface PropertyChangeActionParameters extends PropertyChangeActionValueParameters {
  target: Entity,
  property: string,
  value?: ValueType,
  type?: PropertyChangeType
}
