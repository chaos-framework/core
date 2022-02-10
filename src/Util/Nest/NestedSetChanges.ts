// Returns type, parent id, and entry ids
export class NestedSetChanges {
  hasChanges = false;
  added: { [key: string]: { [key:string]: Set<string> }} = {};
  removed: { [key: string]: { [key:string]: Set<string> }} = {};

  add(level: string, id: string, entry: string) {
    if(this.added[level] === undefined) {
      this.added[level] = {};
    }
    if(this.added[level]![id] === undefined) {
      this.added[level][id] = new Set<string>();
    }
    this.added[level]![id]!.add(entry);
    
    this.hasChanges = true;
  }

  remove(level: string, id: string, entry: string) {
    if(this.removed[level] === undefined) {
      this.removed[level] = {};
    }
    if(this.removed[level]![id] === undefined) {
      this.removed[level][id] = new Set<string>();
    }
    this.removed[level]![id]!.add(entry);
    
    this.hasChanges = true;
  }
}
