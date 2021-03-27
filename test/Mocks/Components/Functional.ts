import { Component, Action, Modifier, Reacter, Listener, Entity, ComponentScope } from '../../../src/internal';

// tslint:disable: max-classes-per-file
export class EmptyComponent extends Component {
  name = "Empty Component";
  unique = false;
}

/*
*   SCOPE TESTS
*/

export class NoScopeSpecified extends Component implements Listener {
  name = "Component that has all types of listeners at default scopes";

  senseEntity(e: Entity): object | undefined {
    return {};
  }

  senseAction(a: Action): object | undefined {
    return {};
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
