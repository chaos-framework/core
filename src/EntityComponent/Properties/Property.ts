import { Entity, Value, PropertyThresholdAction } from '../../internal.js';

export type ValueType = 'current' | 'min' | 'max';
export type ThresholdState = 'out' | 'in' | 'equals';

export class Property implements Property {
  entity: Entity;
  name: string;
  current: Value;
  min: Value;
  max: Value;

  // Relationships of current base value to minimum and maximum thresholds
  minState: 'out' | 'in' | 'equals';
  maxState: 'out' | 'in' | 'equals';

  constructor(entity: Entity, name: string, current: number = 0, min: number = -Infinity, max: number = Infinity) {
    this.entity = entity;
    this.name = name;
    this.current = new Value(this, 'current', current);
    this.min = new Value(this, 'min', min);
    this.max = new Value(this, 'max', max);

    this.minState = this.getMinState();
    this.maxState = this.getMaxState();
    this.maxState = current > max ? 'out' : current < max ? 'in' : 'equals';
  }

  getValue(type: ValueType) {
    return this[type].calculated;
  }

  getMinState(): ThresholdState {
    return this.current < this.min ? 'out' : this.current > this.min ? 'in' : 'equals';
  }

  updateMinState(): ThresholdState | undefined {
    const newState = this.getMinState();
    if (newState !== this.minState) {
      this.minState = newState;
      return newState;
    }
  }

  getMaxState(): ThresholdState {
    return this.current > this.max ? 'out' : this.current < this.max ? 'in' : 'equals';
  }

  updateMaxState(): ThresholdState | undefined {
    const newState = this.getMaxState();
    if (newState !== this.maxState) {
      this.maxState = newState;
      return newState;
    }
  }

  getMinThresholdAction({
    caster,
    target,
    previousValue,
    adjustmentAction,
    oldState,
    using,
    metadata,
  }: PropertyThresholdAction.PropertyParams) {
    return new PropertyThresholdAction({
      caster,
      target,
      propertyName: this.name,
      newValue: this.current.calculated,
      adjustmentAction,
      previousValue,
      oldState,
      using,
      metadata,
      threshold: 'min',
      thresholdValue: this.min.calculated,
      newState: this.minState
    });
  }

  getMaxThresholdAction({
    caster,
    target,
    previousValue,
    adjustmentAction,
    oldState,
    using,
    metadata,
  }: PropertyThresholdAction.PropertyParams) {
    return new PropertyThresholdAction({
      caster,
      target,
      propertyName: this.name,
      newValue: this.current.calculated,
      adjustmentAction,
      previousValue,
      oldState,
      using,
      metadata,
      threshold: 'max',
      thresholdValue: this.max.calculated,
      newState: this.maxState
    });
  }
}
