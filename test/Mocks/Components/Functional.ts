import { Component, Action, Entity, 
  Scope, NestedMap, LogicalAction, CachesSensedEntities } from '../../../src/internal';

// tslint:disable: max-classes-per-file
export class EmptyComponent extends Component {
  unique = false;

  constructor({ name }: { name?: string } = { }) {
    super({ name });
  }
}

/*
*  SENSORS
*/

export class SensesAll extends Component implements CachesSensedEntities {
  sensedEntities: NestedMap<Entity>;
  constructor(){
    super();
    this.sensedEntities = new NestedMap<Entity>(this.id, 'component');
  }

  sense(action: Action): boolean {
    return true;
  }
}

/*
*   SCOPE TESTS
*/

export class NoScopeSpecified extends Component {
  name = "Component that has all types of listeners at default scopes";

  sense(action: Action): boolean {
    return true;
  }

  modify(a: Action) {

  }

  react(a: Action) {
    
  }
}

export class EntityScopeSpecified extends NoScopeSpecified {
  scope: { [key: string]: Scope } = {
    'sense': 'entity',
    'modify': 'entity',
    'react': 'entity'
  }
}

export class WorldScopeSpecified extends NoScopeSpecified {
  scope: { [key: string]: Scope } = {
    'sense': 'world',
    'modify': 'world',
    'react': 'world'
  }
}

export class GameScopeSpecified extends NoScopeSpecified {
  scope: { [key: string]: Scope } = {
    'sense': 'game',
    'modify': 'game',
    'react': 'game'
  }
}

/*
*   EVENT TESTS
*/

export class CancelsSpecificCustomAction extends Component {
  constructor(public nameToCancel: string) {
    super();
  }

  modify(action: Action) {
    if(action instanceof LogicalAction && action.name === this.nameToCancel) {
      action.deny({ priority: Number.MAX_VALUE, by: this });
    }
  }
}
