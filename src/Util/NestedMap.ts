  // tslint:disable: max-classes-per-file

export class NestedMap<T> {
  map = new Map<string, T>();
  entriesByChildren = new Map<string, Set<string>>(); // entry A is granted by child node B, C, and D

  // TODO we could just iterate over these as a simple array and do a reference comparison for finding -- could speed this up?
  parents = new Map<string, NestedMap<T>>();
  children = new Map<string, NestedMap<T>>();

  // Takes the ID of the parent and which type/level it is, ie entity/player/team for visibility nesting
  constructor(public readonly id: string, public readonly level: string) { };

  // NOTE that this will not produce any changes, as the parent will extract values in
  addParent(node: NestedMap<T>, changes: NestedChanges = new NestedChanges()): NestedChanges {
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

  addChild(node: NestedMap<T>, changes: NestedChanges = new NestedChanges()): NestedChanges {
    if(this.children.has(node.id)) {
      return changes;
    }
    this.children.set(node.id, node);
    // Extract the child node's values
    for(const [entryId, entry] of node.map) {
      this.add(entryId, entry, node.id, changes);
    }
    node.addParent(this, changes);
    return changes;
  };

  removeChild(id: string, changes: NestedChanges = new NestedChanges()): NestedChanges {
    const child = this.children.get(id);
    if(child === undefined) {
      return changes;
    }
    // Get all of the child's entries and remove
    for(const [entryId, entry] of child.map) {
      const allChildrenProvidingThisEntry = this.entriesByChildren.get(entryId);
      if(allChildrenProvidingThisEntry !== undefined) {
        allChildrenProvidingThisEntry.delete(id);
        // Check if no other children are providing this entry
        if(allChildrenProvidingThisEntry.size === 0) {
          // Remove from this node
          this.map.delete(entryId);
          this.entriesByChildren.delete(entryId);
          // Track this change
          changes.add(this.level, this.id, entryId);
          // Let parents know that we've lost this value
          for(const [parentId, parentNode] of this.parents) {
            parentNode.remove(entryId, this.id, changes);
          }
        }
      }
    }
    this.children.delete(id);
    return changes;
  };

  add(id: string, value: T, node?: string, changes: NestedChanges = new NestedChanges()): NestedChanges {
    // Record in the result if this is a new entry
    if(!this.map.has(id)){
      changes.add(this.level, this.id, id);
    }
    // Add the entry -- doesn't matter if it's already set
    this.map.set(id, value);
    // If a source was provided (so this node is probably not the leaf) make sure we're tracking where this came from
    if(node !== undefined) {
      if(!(this.entriesByChildren.has(id))) {
        this.entriesByChildren.set(id, new Set<string>());
      }
      this.entriesByChildren.get(id)!.add(node);
    }
    // Add it to all parents
    for(const [parentId, parentNode] of this.parents) {
      parentNode.add(id, value, this.id, changes);
    }
    return changes;
  }

  remove(id: string, node?: string, changes: NestedChanges = new NestedChanges()): NestedChanges  {
    if(!this.map.has(id)) {
      return changes;
    }
    const byChildren = this.entriesByChildren.get(id);
    // See if a node was passed to indicate where this change is coming from downstream
    if(node !== undefined) {
      if(byChildren === undefined) {
        this.map.delete(id);
      } else {
        byChildren.delete(node);
        // See if no other downstream source is providing this entry
        if(byChildren.size === 0) {
          this.map.delete(id);
          changes.add(this.level, this.id, id);
        }
      }
    } else {
      if (byChildren !== undefined) {
        // We can't delete this since it's still being provided to us from somewhere downstream
        return changes;
      } else {
        // If no node specified and no child is providing this, just delete and return the change that was made
        this.map.delete(id);
        changes.add(this.level, this.id, id);
      }
    }
    // Let all parents know that we've removed this entry
    for(const [parentId, parentNode] of this.parents) {
      parentNode.remove(id, this.id, changes);
    }
    return changes;
  }

  get(id: string): T | undefined {
    return this.map.get(id);
  }

  has(id: string): boolean {
    return this.map.has(id);
  }

  getAllParentIds(set: Set<string> = new Set<string>()): Set<string> {
    for(const [id, parent] of this.parents) {
      set.add(id);
      parent.getAllParentIds(set);
    }
    return set;
  }

  // Get the "first" entry, no guarantee of insertion order etc
  pluck(): T | undefined {
    for (const [, entry] of this.map.entries()) {
      return entry;
    }
    return undefined;
  }

}

// Returns type, parent id, and entry ids
export class NestedChanges {
  hasChanges = false;
  changes: { [key: string]: { [key:string]: Set<string> }} = {};

  add(level: string, id: string, entry: string) {
    if(this.changes[level] === undefined) {
      this.changes[level] = {};
    }
    if(this.changes[level]![id] === undefined) {
      this.changes[level][id] = new Set<string>();
    }
    this.changes[level]![id]!.add(entry);
    
    this.hasChanges = true;
  }
}
