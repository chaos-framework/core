import { Event, Action } from '../internal';
import { Queue } from 'queue-typescript';

// Enqueues events (or actions directly) to execute in order
export default class ActionQueue {
  queue: Queue<Event | Action> = new Queue<Event | Action>();     // Current action + reactions
  followups: Queue<Event | Action> = new Queue<Event | Action>(); // Followups

  currentEvent?: Event;
  previousAction?: Action;

  enqueue(o: Action | Event): void {
    this.queue.enqueue(o);
  }

  followup(o: Action | Event): void {
    this.followups.enqueue(o);
  }

  // Get then next Action in the queue, either from an event or directly.
  // Return undefined if none found.
  getNextAction(): Action | undefined {
    // See if the current event is still running
    if (this.currentEvent) {
      const next = this.currentEvent.getNextAction(this.previousAction);
      if (next) {
        return next;
      } else {
        this.currentEvent = undefined;
      }
    }
    if (this.queue.length === 0) {
      // See if there are any in the follow ups
      if (this.followups.length === 0) {
        return undefined;
      }
      this.queue.enqueue(this.followups.dequeue());
    }
    let next = this.queue.dequeue();
    // Keep taking actions and events in case an event doesn't have any actions
    while (next) {
      if (next instanceof Action) {
        this.previousAction = next;
        return next;
      } else {  // an Event
        this.currentEvent = next;
        const nextAction = next.getNextAction();
        if (nextAction) {
          return nextAction;
        }
      }
      // This line will only get hit if a new event doesn't contain any actions
      // Try to grab next event/action
      next = this.queue.dequeue();
    }
    return undefined;
  }


}
