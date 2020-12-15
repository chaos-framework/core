import Action, { ActionParameters } from '../Action';
import Entity from "../../EntityComponent/Entity";
import Vector from '../../Math/Vector';
import World from '../../World/World';

export class MoveAction extends Action {
  target: Entity;
  from: Vector;
  to: Vector;

  constructor({caster, target, to, using, tags = []}: MoveAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.from = target.position;
    this.to = to;
  }

  apply(): boolean {
    return this.target._move(this.to);
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
