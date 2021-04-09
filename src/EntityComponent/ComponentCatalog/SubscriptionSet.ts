import { Subscription } from '../../internal';

export class SubscriptionSet {
    sensor = new Map<string, Subscription>();
    roller = new Map<string, Subscription>();
    modifier = new Map<string, Subscription>();
    reacter = new Map<string, Subscription>();
}