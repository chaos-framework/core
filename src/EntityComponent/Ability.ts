import Event from '../Events/Event';
import Entity from './Entity';
import Component from './Component';

export default abstract class Ability {
  abstract name: string;
  granter?: any;

  constructor() {
  }

  abstract cast(caster: Entity, using?: Entity | Component, target?: any, options?: any): Event;

  // TODO serialize, unserialize
}

export class Grant {
  ability: Ability;
  grantedBy?: Entity | Component;
  using?: Entity | Component;

  constructor(ability: Ability, grantedBy?: Entity | Component, using?: Entity | Component) {
    this.ability = ability;
    if(grantedBy)
      this.grantedBy = grantedBy;
    if(using)
      this.using = using;
  }
}