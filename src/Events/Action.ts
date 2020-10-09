import Entity from "../EntityComponent/Entity";

export default abstract class Action {
  // TODO implement player: Player;
  readonly caster: Entity;
  tags: String[] = [];

  constructor(caster: Entity, tags?: String[]) {
    this.caster = caster;
    if(tags){
      this.tags = tags;
    }
  }

  abstract apply(): void;
}

export class RelativeMovement extends Action {
  mover: Entity;
  x: number;
  y: number;

  constructor(caster: Entity, mover: Entity, x: number, y: number, tags?: String[]) {
    super(caster, tags);
    this.mover = mover;
    this.x = x;
    this.y = x;
  }

  apply() {
    this.mover.x += this.x;
    this.mover.y += this.y;
  }
}

export class AbsoluteMovement extends Action {
  mover: Entity;
  x: number;
  y: number;

  constructor(caster: Entity, mover: Entity, x: number, y: number, tags?: String[]) {
    super(caster, tags);
    this.mover = mover;
    this.x = x;
    this.y = x;
  }

  apply() {
    this.mover.x = this.x;
    this.mover.y = this.y;
  }
}

export class PropertyAdjustment extends Action {
  target: Entity;
  property: String;
  amount: number;

  constructor(caster: Entity, target: Entity, property: string, amount: number, tags?: String[]) {
    super(caster, tags);
    this.target = target;
    this.property = property;
    this.amount = amount;
  }

  apply() {
    // TODO figure out property adjustments
  }
}

// TODO PropertyModification

// export class MapChange extends Action {
//   constructor(caster: Entity) {
//     super(caster);
//   }
// }


// export class StatusApply extends Action {
//   constructor(caster: Entity) {
//     super(caster);
//   }
// }
