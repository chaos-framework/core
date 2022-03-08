import {
  Component,
  Action,
  Entity,
  Scope,
  NestedMap,
  LogicalAction,
  CachesSensedEntities,
  ActionHandler,
  EffectGenerator,
  MoveAction
} from '../../../src/internal.js';

// tslint:disable: max-classes-per-file
export class EmptyComponent extends Component {
  unique = false;

  constructor({ name }: { name?: string } = {}) {
    super({ name });
  }
}

/*
 *  SENSORS
 */

export class SensesAll extends Component implements CachesSensedEntities {
  sensedEntities: NestedMap<Entity>;
  constructor() {
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

function* emptyActionHandler(action: Action): EffectGenerator {
  yield action.react(action);
  return false;
}

export class DefaultScopeSpecified extends Component {
  actionHandlers = {
    default: {
      sense: [emptyActionHandler.bind(this)],
      modify: [emptyActionHandler.bind(this)],
      react: [emptyActionHandler.bind(this)]
    }
  };
}

export class EntityScopeSpecified extends Component {
  actionHandlers = {
    entity: {
      sense: [emptyActionHandler.bind(this)],
      modify: [emptyActionHandler.bind(this)],
      react: [emptyActionHandler.bind(this)]
    }
  };
}

export class WorldScopeSpecified extends Component {
  actionHandlers = {
    world: {
      sense: [emptyActionHandler.bind(this)],
      modify: [emptyActionHandler.bind(this)],
      react: [emptyActionHandler.bind(this)]
    }
  };
}

export class GameScopeSpecified extends Component {
  actionHandlers = {
    game: {
      sense: [emptyActionHandler.bind(this)],
      modify: [emptyActionHandler.bind(this)],
      react: [emptyActionHandler.bind(this)]
    }
  };
}

/*
 *   EVENT TESTS
 */

export class CancelsSpecificCustomAction extends Component {
  constructor(public nameToCancel: string) {
    super();
  }

  modify(action: Action) {
    if (action instanceof LogicalAction && action.name === this.nameToCancel) {
      action.addPermission(false, { priority: Number.MAX_VALUE, by: this });
    }
  }
}
