import Entity from './Entity'

export default interface Status {
    name: string;
    description: string;

}

class Action {
    caster: Entity;
    target: Entity; // should never be a collection of targets, since it's one action per
}

interface Reactive {
    // scope?
    modify(e: any): void;
    react(e: any): void;
}

class Undead implements Status, Reactive {
    name = "Undead";
    description = "Healing does damage to this creature."

    modify(e: any): void {
        if(e.)
    }

    react(e: any): void {

    }
}