import { isUndefined } from 'lodash';
import { Component, isSensor, isModifier, isReacter, ComponentContainer, Scope, Game, Team, Player, World } from '../internal';

type Subscription = [Component, ComponentContainer];

const validSubscriptions = {
  entity: ['world', 'player', 'team', 'game'],
  world: ['game'],
  player: ['team', 'game'],
  team: ['game'],
  game: [] as string[],
}

interface ComponentsByType {
  sensor: Map<string, Component>,
  roller: Map<string, Component>,
  modifier: Map<string, Component>,
  reacter: Map<string, Component>
}

interface SubscriptionsByScope {
  entity: Map<string, Subscription>,
  world: Map<string, Subscription>,
  player: Map<string, Subscription>,
  team: Map<string, Subscription>,
  game: Map<string, Subscription>
}

export default class ComponentCatalog {
  parentScope: Scope;

  constructor(private parent: ComponentContainer) {
    // Get the parent's scope based on the parent's type
   if (parent instanceof World) {
      this.parentScope = 'world';
    } else if (parent instanceof Player) {
      this.parentScope = 'player';
    } else if (parent instanceof Team) {
      this.parentScope = 'team';
    } else if (parent instanceof Game) {
      this.parentScope = 'game';
    } else {
      this.parentScope = 'entity';
    }
  }

  // All components owned by this ComponentContainer
  all: Map<string, Component> = new Map<string, Component>();

  // Components owned by this ComponentContainer by type
  byType: ComponentsByType = { 
    sensor: new Map<string, Component>(),
    roller: new Map<string, Component>(),
    modifier: new Map<string, Component>(),
    reacter: new Map<string, Component>() 
  };

  // Components from other containers subscribed (listening/interacting) to this ComponentContainer
  subscribers: ComponentsByType = { 
    sensor: new Map<string, Component>(),
    roller: new Map<string, Component>(),
    modifier: new Map<string, Component>(),
    reacter: new Map<string, Component>() 
  };

  // Components owned by this ComponentContainer that are subscribed to components in other
  subscriptions: SubscriptionsByScope = {
    entity: new Map<string, Subscription>(),
    world: new Map<string, Subscription>(),
    player: new Map<string, Subscription>(),
    team: new Map<string, Subscription>(),
    game: new Map<string, Subscription>(),
  };

  connectComponent(c: Component) {
    const { id } = c;
    // Connect generically
    this.all.set(id, c);

    // Figure out which, if any, interactive types this components is (ie modifier, reacter) and connect appropriately
    if(isSensor(c)) {
      this.byType.sensor.set(id, c);
      const scope: Scope | undefined = c.scope.sensor;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope)) {

        this.subscriptions[scope].set(id, c);
      }
    }
  }

  subscribeToAll() {

  }

  private subscribe(c: Component, scope: Scope) {

  }

  disconnectComponent(c: Component) {
    // Unsubscribe from other components
  }

  // Susbcribe an external component to this catalog
  subscribeComponent(c: Component, scope: Scope) {

  }

  // TODO method for another collection to call to unhook on their own deletion.. 'unsubscribe'?

}
