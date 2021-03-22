import { Component, isSensor, isModifier, isReacter, ComponentType, ComponentContainer, Scope, Game, Team, Player, World } from '../internal';

interface Subscription {
  component: Component,
  to: ComponentContainer,
  type: ComponentType,
  scope: Scope
}

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

export class ComponentCatalog {
  // Scope of parent object -- ie being owned by a World would be 'world'
  parentScope: Scope;

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

  // Shut this catalog down
  unload() {}

  // Add a component to this catalog
  addComponent(c: Component) {
    const { id } = c;
    this.all.set(id, c);
    this.createSubscriptions(c);
  }

  // Remove a component from this catalog, unsubscribing all
  removeComponent(c: Component) {
    const { id } = c;
    this.all.delete(id);
    this.byType.sensor.delete(id);
    this.byType.roller.delete(id);
    this.byType.modifier.delete(id);
    this.byType.reacter.delete(id);
    // Unsubscribe from other components if needed
    if(this.subscriptions.entity.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.world.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.player.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.team.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.game.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
  }

  unsubscribeFromOther(id: string, subscription: Subscription) {
    subscription.to.components.removeSubscriber(id, subscription.type);
  }

  // Create all outgoing subscriptions
  subscribeToAll() {
    this.unsubscribeFromAll();  // clear any old subscriptions
    for(let [id, component] of this.all) {
      this.createSubscriptions(component);
    }
  }

  unsubscribeFromAll() {

  }

  private createSubscriptions(c: Component) {
    const { id } = c;
    // Figure out which, if any, interactive types this components is and connect appropriately
    if(isSensor(c)) {
      this.byType.sensor.set(id, c);
      const scope = c.scope.sensor;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(c, 'sensor', scope);
      }
    }
    if(isModifier(c)) {
      this.byType.modifier.set(id, c);
      const scope = c.scope.modifier;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(c, 'modifier', scope);
      }
    }
    if(isReacter(c)) {
      this.byType.reacter.set(id, c);
      const scope = c.scope.reacter;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(c, 'reacter', scope);
      }
    }
  }

  // Subscribe one of these components to another catalog
  private subscribeToOther(c: Component, type: ComponentType, scope: Scope) {
    // Defer to parent to decide which ComponentContainer fits the relative scope
    const container = this.parent.getComponentContainerByScope(scope);
    // Subscribe to these containers
    if(container) {
      container.components.attachSubscriber(c, type);
      this.subscriptions[scope].set(c.id, { 
        component: c, 
        to: container,
        type,
        scope
       });
    }
  }

  // Susbcribe an external component to this catalog
  attachSubscriber(c: Component, type: ComponentType) {
    this.subscribers[type].set(c.id, c);
  }

  removeSubscriber(id: string, type: ComponentType) {
    this.subscribers[type].delete(id);
  }

}
