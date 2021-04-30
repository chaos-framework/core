import { compact } from 'lodash';
import _ = require('lodash');
import { SensoryInformation } from '../Events/Interfaces';
import { Component, isSensor, isModifier, isReacter, ComponentType, ComponentContainer, Scope, Game, Team, Player, World, Action, Entity, Listener, Modifier, Reacter } from '../internal';
import { Subscription } from './ComponentCatalog/Subscription';
import { SubscriptionSet } from './ComponentCatalog/SubscriptionSet';
import { Sensor } from './Interfaces';

const validSubscriptions = {
  entity: ['world', 'player', 'team', 'game'],
  world: ['game'],
  player: ['team', 'game'],
  team: ['game'],
  game: [] as string[],
}

export class ComponentCatalog implements Listener {
  // Scope of parent object -- ie being owned by a World would be 'world'
  parentScope: Scope;

  // All components owned by this ComponentContainer
  all: Map<string, Component> = new Map<string, Component>();

  // Components from other containers subscribed (listening/interacting) to this ComponentContainer
  subscribers = new Map<string, Subscription>();
  subscribersByType = { 
    sensor: new Map<string, Sensor>(),
    roller: new Map<string, Component>(),
    modifier: new Map<string, Modifier>(),
    reacter: new Map<string, Reacter>() 
  };

  // Things we're subscribed to, mapped out in different dimensions
  subscriptions = new Map<string, Subscription>();
  subscriptionsByComponent = new Map<string, Map<string, Subscription>>();
  subscriptionsByTarget = new Map<string, Map<string, Subscription>>();
  subscriptionsByScope = new Map<Scope, Map<string, Subscription>>();

  constructor(private parent: ComponentContainer) {
    // Get the parent's scope based on the parent's type
   if (parent instanceof World) {
      this.parentScope = 'world';
    } else if (parent instanceof Game) {
      this.parentScope = 'game';
    } else {
      this.parentScope = 'entity';
    }
  }

  addComponent(component: Component) {
    this.all.set(component.id, component);
    this.createComponentSubscriptions(component);
  }

  createComponentSubscriptions(component: Component) {
    // See if this component modifies, react, etc and which scopes if so
    if(isSensor(component)){
      const scope = component.scope.sensor;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(component, 'sensor', scope);
      } else {
        this.attach(new Subscription(component, this, this, 'sensor', this.parentScope));
      }
    }
    if(isModifier(component)){
      const scope = component.scope.modifier;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(component, 'modifier', scope);
      } else {
        this.attach(new Subscription(component, this, this, 'modifier', this.parentScope));
      }
    }
    if(isReacter(component)){
      const scope = component.scope.reacter;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(component, 'reacter', scope);
      } else {
        this.attach(new Subscription(component, this, this, 'reacter', this.parentScope));
      }
    }
  }

  removeComponent(component: string | Component) {
    const id = typeof component === 'string' ? component : component.id;
    this.all.delete(id);
    // Terminate any outbound subscriptions this component is responsible for
    this.subscriptionsByComponent.get(id)?.forEach(subscription => {
      subscription.target.detach(subscription);
    });
    this.subscriptionsByComponent.delete(id);
  }

  // Attach a subscriber to this component
  attach(subscription: Subscription) {
    const { component, type } = subscription;
    // Add subscriber to full list
    this.subscribers.set(subscription.id, subscription);
    // Attach by type, ie modifier or reacter
    switch(type) {
      case 'sensor':
        const sensor = component as unknown as Sensor;
        this.subscribersByType[type].set(component.id, sensor);
        break;
      case 'modifier':
        const modifier = component as unknown as Modifier;
        this.subscribersByType[type].set(component.id, modifier);
        break;
      case 'reacter':
        const reacter = component as unknown as Reacter;
        this.subscribersByType[type].set(component.id, reacter);
        break;
    }
  }

  // Detach subscriber from this
  detach(subscription: Subscription) {
    const { type, subscriber, component } = subscription;
    this.subscribersByType[subscription.type].delete(subscription.component.id);
    this.subscribers.delete(subscription.id);
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
    this.subscribersByType = { 
      sensor: new Map<string, Sensor>(),
      roller: new Map<string, Component>(),
      modifier: new Map<string, Modifier>(),
      reacter: new Map<string, Reacter>() 
    };
  }

  // Delete all components and terminate all incoming / outgoing subscriptions
  unpublish() {
    // Notify all external subscribers
    for(const [id, subscription] of this.subscribers) {
      subscription.subscriber.unsubscribe(subscription);
    }
    // Terminate all outgoing subscriptions
    for(const [id, subscription] of this.subscriptions) {
      subscription.target.detach(subscription);
    }
    // Unpublish all contained components
    for(const [id, component] of this.all) {
      component.unpublish();
    }
  }

  // Subscribe one of these components to another catalog
  private subscribeToOther(component: Component, type: ComponentType, scope: Scope) {
    // Defer to parent to decide which ComponentContainer fits the relative scope
    const target = this.parent.getComponentContainerByScope(scope);
    if(target !== undefined) {
      const subscription = new Subscription(component, this, target.components, type, scope);
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

  // ACTION METHODS
  sense(action: Action): SensoryInformation | boolean {
    for(const [id, component] of this.subscribersByType.sensor) {
      if(component.sense(action) !== false) {
        return true;
      }
    }
    return false;
  }

  modify(action: Action) {
    for(const [id, component] of this.subscribersByType.modifier) {
      component.modify(action);
    }
  }

  react(action: Action) {
    for(const [id, component] of this.subscribersByType.reacter) {
      component.react(action);
    }
  }

  // MISC
  is(componentName: string): Component | undefined {
    return this.has(componentName);
  }

  has(componentName: string): Component | undefined {
    // TODO optimize
    return Array.from(this.all.values()).find(c => c.name === componentName);
  }

}
