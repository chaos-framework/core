import { 
  Action, Chaos, Component, Subscription, ComponentContainer,
  Scope, World, Entity, actionFunction, isActionFunction
} from '../../internal.js';

const validSubscriptions = {
  entity: ['world', 'player', 'team', 'game'],
  world: ['game'],
  player: ['team', 'game'],
  team: ['game'],
  game: [] as string[],
}

export class ComponentCatalog {
  // Scope of parent object -- ie being owned by a World would be 'world'
  parentScope: Scope;

  // All components owned by this ComponentContainer
  all: Map<string, Component> = new Map<string, Component>();

  // Components by name
  byName: Map<string, Component[]> = new Map<string, Component[]>();

  // Components from other containers subscribed (listening/interacting) to this ComponentContainer
  subscribers = new Map<string, Subscription>();
  subscriberFunctionsByPhase = new Map<string, Map<string, actionFunction>>();

  // Things we're subscribed to, mapped out in different dimensions
  subscriptions = new Map<string, Subscription>();
  subscriptionsByComponent = new Map<string, Map<string, Subscription>>();
  subscriptionsByTarget = new Map<string, Map<string, Subscription>>();
  subscriptionsByScope = new Map<Scope, Map<string, Subscription>>();

  constructor(private parent: ComponentContainer) {
    // Get the parent's scope based on the parent's type
    if(parent.id !== '___GAMEREF') {
      if (parent instanceof World) {
        this.parentScope = 'world';
      } else if (parent instanceof Entity) {
        this.parentScope = 'entity';
      } else {
        this.parentScope = 'entity'
      }
    } else {
      this.parentScope = 'game';
    }
  }

  addComponent(component: Component) {
    this.all.set(component.id, component);
    if(!this.byName.has(component.name)) {
      this.byName.set(component.name, [component]);
    } else {
      this.byName.get(component.name)!.push(component);
    }
    this.createComponentSubscriptions(component);
    component.parent = this.parent;
  }

  createComponentSubscriptions(component: Component) {
    for(const phase of Chaos.getPhases()) {
      if(typeof phase === 'string') {
        let fn = (component as any)[phase];
        if(isActionFunction(fn)) {
          fn = fn.bind(component);
          const scope = component.scope[phase];
          if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
            this.subscribeToOther(component, phase, fn, scope);
          } else {
            this.attach(new Subscription(component, this, this, phase, fn, this.parentScope));
          }
        }
      }
    }
  }

  removeComponent(component: Component) {
    const id = component.id;
    if(!this.all.has(id)) {
      return; // sometimes bad chain of action functions will try to remove this component twice
    }
    this.all.delete(id);
    // Stop tracking by name
    const arrayByName = this.byName.get(component.name)!;
    if(arrayByName !== undefined) {
      arrayByName.splice(arrayByName.findIndex(c => c === component), 1);
      if (arrayByName.length === 0) {
        this.byName.delete(component.name);
      }
    }
    // Unhook all functions
    for(const phase of Chaos.getPhases()) {
      this.subscriberFunctionsByPhase.get(phase)?.delete(component.id);
    }
    // Terminate any outbound subscriptions this component is responsible for
    this.subscriptionsByComponent.get(id)?.forEach(subscription => {
      subscription.target.detach(subscription);
      this.unsubscribe(subscription);
    });
    this.subscriptionsByComponent.delete(id);
  }

  // Attach a subscriber to this component
  attach(subscription: Subscription) {
    const { component, phase } = subscription;
    // Add subscriber to full list
    this.subscribers.set(subscription.id, subscription);
    // Attach by type, ie modifier or reacter
    const map = this.subscriberFunctionsByPhase.get(phase);
    if(map === undefined) {
      const newMap = new Map<string, actionFunction>();
      newMap.set(subscription.component.id, subscription.fn);
      this.subscriberFunctionsByPhase.set(phase, newMap);
    } else {
      map.set(subscription.component.id, subscription.fn);
    }
  }

  // Detach subscriber from this
  detach(subscription: Subscription) {
    const { id, phase, component } = subscription;
    const byPhase = this.subscriberFunctionsByPhase.get(phase);
    if(byPhase !== undefined) {
      byPhase.delete(component.id);
      if(byPhase.size === 0) {
        this.subscriberFunctionsByPhase.delete(phase);
      }
    }
    this.subscribers.delete(id);
  }

  // Terminate an outgoing subscription
  unsubscribe(subscription: Subscription) {
    const { component, target } = subscription;
    this.subscriptionsByComponent.get(component.id)?.delete(subscription.id);
    if(this.subscriptionsByComponent.get(component.id)?.size === 0) {
      this.subscriptionsByComponent.delete(component.id);
    }
    this.subscriptionsByTarget.get(target.parent.id)?.delete(subscription.id);
    if(this.subscriptionsByComponent.get(target.parent.id)?.size === 0) {
      this.subscriptionsByComponent.delete(target.parent.id);
    }
  }

  // Resets all subscriptions, if there were any, from before the parent being published
  publish() {
    if(this.subscribers.size > 0) {
      this.clearSubscriptions();
    }
    this.all.forEach(component => this.createComponentSubscriptions(component));
  }

  clearSubscriptions() {
    this.subscribers = new Map<string, Subscription>();
    this.subscriberFunctionsByPhase = new Map<string, Map<string, actionFunction>>();
  }

  // Delete all components and terminate all incoming / outgoing subscriptions
  unpublish() {
    // Notify all external subscribers and remove functions
    for(const [, subscription] of this.subscribers) {
      const { phase, subscriber } = subscription;
      subscription.subscriber.unsubscribe(subscription);
      this.subscriberFunctionsByPhase.get(phase)?.delete(subscriber.parent.id);
    }
    // Terminate all outgoing subscriptions
    for(const [, subscription] of this.subscriptions) {
      subscription.target.detach(subscription);
    }
    // Unpublish all contained components
    for(const [, component] of this.all) {
      component.unpublish();
    }
  }

  clear() {
    this.all.clear();
    this.clearSubscriptions();
  }

  // Subscribe one of these components to another catalog
  private subscribeToOther(component: Component, phase: string, fn: actionFunction, scope: Scope) {
    // Defer to parent to decide which ComponentContainer fits the relative scope
    const target = this.parent.getComponentContainerByScope(scope); 
    if(target !== undefined) {
      const subscription = new Subscription(component, this, target.components, phase, fn, scope);
      // Subscribe to these containers
      target.components.attach(subscription);
      // Store general
      this.subscriptions.set(subscription.id, subscription);
      // Store by local component
      if(!this.subscriptionsByComponent.has(component.id)) {
        this.subscriptionsByComponent.set(component.id, new Map<string, Subscription>());
      }
      this.subscriptionsByComponent.get(component.id)!.set(subscription.id, subscription);
      // Store by target
      if(!this.subscriptionsByTarget.has(target.id)) {
        this.subscriptionsByTarget.set(target.id, new Map<string, Subscription>());
      }
      this.subscriptionsByTarget.get(target.id)!.set(subscription.id, subscription);
      // Store by scope
      if(!this.subscriptionsByScope.has(scope)) {
        this.subscriptionsByScope.set(scope, new Map<string, Subscription>());
      }
      this.subscriptionsByScope.get(scope)!.set(subscription.id, subscription);
    }
  }

  handle(phase: string, action: Action) {
    const functions = this.subscriberFunctionsByPhase.get(phase);
    if (functions !== undefined) {
      for(const [, fn] of functions) {
        fn(action);
      }
    }
  }

  // MISC
  is(componentName: string): boolean {
    return this.has(componentName);
  }

  has(componentName: string): boolean {
    // TODO optimize
    return this.byName.has(componentName);
  }

  get(componentName: string): Component | undefined {
    const components = this.byName.get(componentName);
    if(components && components.length > 0) {
      return components[0];
    } else {
      return undefined;
    }
  }

  getAll(componentName: string): Component[] | undefined {
    return this.byName.get(componentName);
  }

}
