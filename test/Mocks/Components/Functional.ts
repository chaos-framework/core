import { Component, Action, Listener, Entity, 
  ComponentScope, SensoryInformation, Sensor, NestedChanges, NestedMap } from '../../../src/internal';

// tslint:disable: max-classes-per-file
export class EmptyComponent extends Component {
  name = "Empty Component";
  unique = false;
}

export class SensesAll extends Component implements Sensor {
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

export class NoScopeSpecified extends Component implements Listener {
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
  scope: ComponentScope = {
    'sensor': 'entity',
    'modifier': 'entity',
    'reacter': 'entity'
  }
}

export class WorldScopeSpecified extends NoScopeSpecified {
  scope: ComponentScope = {
    'sensor': 'world',
    'modifier': 'world',
    'reacter': 'world'
  }
}

export class GameScopeSpecified extends NoScopeSpecified {
  scope: ComponentScope = {
    'sensor': 'game',
    'modifier': 'game',
    'reacter': 'game'
  }
}
