import { IEntity, Component, Value } from "../../internal";

export default abstract class Modification {
  amount: number;
  value?: Value;
  by?: IEntity | Component;

  constructor(amount: number) {
    this.amount = amount;
  }

  // Remove this modification from the parent value, which is always added by the value when attached
  detach() {
    if(this.value) {
      this.value._remove(this);
    }
  }

  abstract apply(x: number): number;
}

export class AdjustmentModification extends Modification {
  apply(x: number): number {
    return x + this.amount;
  }
}
export class MultiplierModification extends Modification {
  apply(x: number): number {
    return x * this.amount;
  }
}

export class AbsoluteModification extends Modification {
  apply(x: number): number {
    return this.amount;
  }
}
