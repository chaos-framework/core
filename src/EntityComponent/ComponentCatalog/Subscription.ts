import { Component, ComponentContainer, ComponentType, Scope } from "../../internal";

export interface Subscription {
    component: Component,
    to: ComponentContainer,
}