  // tslint:disable: max-classes-per-file

export class NestedMap<T> {
  entries = new Map<string, T>();
  entriesByChildren = new Map<string, Set<string>>(); // entry A is granted by child node B, C, and D

  // TODO we could just iterate over these as a simple array and do a reference comparison for finding -- could speed this up?
  parents = new Map<string, NestedMap<T>>();
  children = new Map<string, NestedMap<T>>();

  // Takes the ID of the parent and which type/level it is, ie entity/player/team for visibility nesting
  constructor(public readonly id: string, public readonly level: string) { };

  addParent(id: string, node: NestedMap<T>, changes: NestedChanges = new NestedChanges()): NestedChanges {
    // Make sure we don't have this parent already -- no need to do anything if so
    if(this.parents.has(node.id)) {
      return changes;
    }
    // Add the parent
    this.parents.set(id, node);
    // Make sure the parent is getting receiving upstream all entries from this node
    for(const [id, entry] of this.entries) {
      node.add(id, entry, this.id, changes);
    }
    return changes;
  };

  removeParent(id: string) {
    this.parents.delete(id); // nothing else to do here, right? 
  };

  addChild(id: string, node: NestedMap<T>, changes: NestedChanges = new NestedChanges()): NestedChanges {
    this.children.set(id, node);
    // nothing else to do here, as the children are responsible for aggregating upward?
      // I need to figure out if the parent should call addParent on child or vice-versa.. could hinge on .has(whichever.id) check on both sides
        // would make it easier on other code..
    return changes;
  };

  removeChild(id: string, changes: NestedChanges = new NestedChanges()): NestedChanges {
    // const child = this.children.get(id);
    // if(child === undefined) {
    //   return changes;
    // }
    // // Get all of the child's entries and remove
    // for(const [entryId, entry] of child.entries) {
    //   const allChildrenProvidingThisEntry = this.entriesByChildren.get(entryId);
    //   if(allChildrenProvidingThisEntry !== undefined) {
    //     allChildrenProvidingThisEntry?.delete(id);
    //     if(allChildrenProvidingThisEntry.size === 0) {
    //       this.entries.delete(entryId);
    //       // TODO remove from parents
    //       this.entriesByChildren.delete(entryId);
    //     }
    //   }
    // }
    // this.children.delete(id);
    // // TODO
    return changes;
  };

  add(id: string, value: T, node?: string, changes: NestedChanges = new NestedChanges()): NestedChanges  {
    // Record in the result if this is a new entry
    if(!this.entries.has(id)){
      changes.add(this.level, this.id, id);
    }
    // Add the entry
    this.entries.set(id, value);
    // If a source was provided (so this node is probably not the leaf) make sure we're tracking where this came from
    if(node !== undefined) {
      if(!(this.entriesByChildren.has(node))) {
        this.entriesByChildren.set(node, new Set<string>());
      }
      this.entriesByChildren.get(node)!.add(id);
    }
    // Add it to all parents
    for(const [id, parent] of this.parents) {
      parent.add(id, value, this.id, changes);
    }
    return changes;
  }

  remove(id: string, node?: string, changes: NestedChanges = new NestedChanges()): NestedChanges  {
    if(!this.entries.has(id)) {
      return changes;
    }
    const byChildren = this.entriesByChildren.get(id);
    // See if a node was passed to indicate where this change is coming from downstream
    if(node !== undefined) {
      if(byChildren === undefined) {
        this.entries.delete(id);
      } else {
        byChildren.delete(node);
        // See if no other downstream source is providing this entry
        if(byChildren.size === 0) {
          this.entries.delete(id);
          changes.add(this.level, this.id, id);
        }
      }
    } else {
      if (byChildren !== undefined) {
        // We can't delete this since it's still being provided to us from somewhere downstream
        return changes;
      } else {
        // If no node specified and no child is providing this, just delete and return the change that was made
        this.entries.delete(id);
        changes.add(this.level, this.id, id);
      }
    }
    return changes;
  }

  get(id: string): T | undefined {
    return this.entries.get(id);
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

}

// Returns type, parent id, and entry ids
export class NestedChanges {
  changes: { [key: string]: { [key:string]: Set<string> }} = {};

  add(variant: string, id: string, entry: string) {
    if(this.changes[variant] === undefined) {
      this.changes[variant] = {};
    }
    if(this.changes[variant]![id] === undefined) {
      this.changes[variant][id] = new Set<string>();
    }
    this.changes[variant]![id]!.add(entry);
  }
}
