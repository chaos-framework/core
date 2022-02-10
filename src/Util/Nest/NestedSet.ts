  // tslint:disable: max-classes-per-file
import { NestedSetChanges } from "../../internal.js";

export class NestedSet {
  entriesByChildren = new Map<string, Set<string>>(); // entry A is granted by child node B, C, and D

  // TODO we could just iterate over these as a simple array and do a reference comparison for finding -- could speed this up?
  parents = new Map<string, NestedSet>();
  children = new Map<string, NestedSet>();

  // Takes the ID of the parent and which type/level it is, ie entity/player/team for visibility nesting
  constructor(public readonly id: string, public readonly level: string, public readonly set = new Set<string>()) { };

  // NOTE that this will not produce any changes, as the parent will extract values in
  addParent(node: NestedSet, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges {
    // Make sure we don't have this parent already -- no need to do anything if so
    if(this.parents.has(node.id)) {
      return changes;
    }
    // Add the parent
    this.parents.set(node.id, node);
    return changes;
  };

  removeParent(id: string) {
    this.parents.delete(id); // nothing else to do here, right? 
  };

  addChild(node: NestedSet, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges {
    if(this.children.has(node.id)) {
      return changes;
    }
    this.children.set(node.id, node);
    // Extract the child node's values
    for(const value of node.set) {
      this.add(value, node.id, changes);
    }
    node.addParent(this, changes);
    return changes;
  };

  removeChild(id: string, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges {
    const child = this.children.get(id);
    if(child === undefined) {
      return changes;
    }
    // Get all of the child's entries and remove
    for(const value of child.set) {
      const allChildrenProvidingThisEntry = this.entriesByChildren.get(value);
      if(allChildrenProvidingThisEntry !== undefined) {
        allChildrenProvidingThisEntry.delete(id);
        // Check if no other children are providing this entry
        if(allChildrenProvidingThisEntry.size === 0) {
          // Remove from this node
          this.set.delete(value);
          this.entriesByChildren.delete(value);
          // Track this change
          changes.remove(this.level, this.id, value);
          // Let parents know that we've lost this value
          for(const [parentId, parentNode] of this.parents) {
            parentNode.remove(value, this.id, changes);
          }
        }
      }
    }
    this.children.delete(id);
    return changes;
  };

  add(value: string, node?: string, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges {
    // Record in the result if this is a new entry
    if(!this.set.has(value)){
      changes.add(this.level, this.id, value);
    }
    // Add the entry -- doesn't matter if it's already set
    this.set.add(value);
    // If a source was provided (so this node is probably not the leaf) make sure we're tracking where this came from
    if(node !== undefined) {
      if(!(this.entriesByChildren.has(value))) {
        this.entriesByChildren.set(value, new Set<string>());
      }
      this.entriesByChildren.get(value)!.add(node);
    }
    // Add it to all parents
    for(const [parentId, parentNode] of this.parents) {
      parentNode.add(value, this.id, changes);
    }
    return changes;
  }

  addSet(values: Set<string>, node?: string, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges {
    for (const value of values) {
      this.add(value, node, changes);
    }
    return changes;
  }

  remove(value: string, node?: string, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges  {
    if(!this.set.has(value)) {
      return changes;
    }
    const byChildren = this.entriesByChildren.get(value);
    // See if a node was passed to indicate where this change is coming from downstream
    if(node !== undefined) {
      if(byChildren === undefined) {
        this.set.delete(value);
      } else {
        byChildren.delete(node);
        // See if no other downstream source is providing this entry
        if(byChildren.size === 0) {
          this.set.delete(value);
          changes.remove(this.level, this.id, value);
        }
      }
    } else {
      if (byChildren !== undefined) {
        // We can't delete this since it's still being provided to us from somewhere downstream
        return changes;
      } else {
        // If no node specified and no child is providing this, just delete and return the change that was made
        this.set.delete(value);
        changes.remove(this.level, this.id, value);
      }
    }
    // Let all parents know that we've removed this entry
    for(const [parentId, parentNode] of this.parents) {
      parentNode.remove(value, this.id, changes);
    }
    return changes;
  }

  removeSet(values: Set<string>, node?: string, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges  {
    for (const value of values) {
      this.remove(value, node, changes);
    }
    return changes;
  }

  replace(values: Set<string>, node?: string, changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges  {
    const toRemove = new Set<string>();
    const toAdd = new Set<string>();
    for (const value of values) {
      if (!this.set.has(value)) {
        toAdd.add(value);
      }
    }
    for (const existing of this.set) {
      if (!values.has(existing)) {
        toRemove.add(existing);
      }
    }
    this.addSet(toAdd, node, changes);
    this.removeSet(toRemove, node, changes);
    return changes;
  }

  clear(changes: NestedSetChanges = new NestedSetChanges()): NestedSetChanges {
    for (const value of this.set) {
      changes.remove(this.level, this.id, value);
    }
    this.set.clear();
    return changes;
  }

  has(id: string): boolean {
    return this.set.has(id);
  }

  getAllParentIds(set: Set<string> = new Set<string>()): Set<string> {
    for(const [id, parent] of this.parents) {
      set.add(id);
      parent.getAllParentIds(set);
    }
    return set;
  }

  // Get the "first" entry, no guarantee of insertion order etc
  pluck(): string | undefined {
    for (const [, entry] of this.set.entries()) {
      return entry;
    }
    return undefined;
  }

}
