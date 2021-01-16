import { Action, ActionParameters, Entity, Game, Vector, World } from '../../internal'; 

export class MoveAction extends Action {
  target: Entity;
  from: Vector;
  to: Vector;

  static requiredFields: string[] = ['target', 'to', 'from'];

  constructor({caster, target, to, using, tags = []}: MoveAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.from = target.position;
    this.to = to;
  }

  apply(): boolean {
    return this.target._move(this.to);
  }

  initialize() {
    // Ask world to load new chunks if needed.
    const { world } = this.target;
    if(world && this.from.differentChunkFrom(this.to)) {
      world.addView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
    }
  }

  teardown() {
    const { world } = this.target;
    if(world && this.from.differentChunkFrom(this.to)) {
      // Check if this entity is active, and therefore needs to persist the world around it
      // Also check if action was permitted. If so, remove old view. If neither is true, just remove old.
      if(this.target.active && this.permitted) {
        world.removeView(this.target, this.from.toChunkSpace(), this.to.toChunkSpace());
      } else {
        world.removeView(this.target, this.to.toChunkSpace(), this.from.toChunkSpace());
      }
    }
  }

  static unserialize(json: any): MoveAction {
    if(!Action.serializedHasRequiredFields(json)) {
      throw new Error();
    }
    const game = Game.getInstance();
    const target: Entity | undefined = game.getEntity(json['target']);
    if(target === undefined){
      throw new Error();
    }

    const caster: Entity | undefined = game.getEntity(json['caster']);
    const using: Entity | undefined = game.getEntity(json['using']);
    const from: Vector = Vector.unserialize(json['from']);
    const to: Vector = Vector.unserialize(json['to']);
    // TODO tags

    return new MoveAction({caster, target, using, to});

  }
}

export namespace MoveAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    to: Vector;
  }
}

export class RelativeMoveAction extends Action {
  target: Entity;
  from: Vector;
  amount: Vector;

  constructor({caster, target, amount, using, tags = []}: RelativeMoveAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.from = target.position;
    this.amount = amount;
  }

  apply(): boolean {
    const finalPosition = this.target.position.add(this.amount);
    return this.target._move(finalPosition);
  }
}

export namespace RelativeMoveAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    amount: Vector;
  }
}

export class ChangeWorldAction extends Action {
  target: Entity;
  from: World;
  to: World;
  originPosition: Vector;
  position: Vector;

  constructor({caster, target, from, to, position, using, tags = []}: ChangeWorldAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.from = from;
    this.to = to;
    this.position = position;
    this.originPosition = target.position;
  }

  apply(): boolean {
    return this.target._changeWorlds(this.to, this.position);
  }
}

export namespace ChangeWorldAction {
  export interface Params extends EntityParams {
    target: Entity;
  }
  
  export interface EntityParams extends ActionParameters {
    from: World,
    to: World,
    position: Vector;
  }
}
