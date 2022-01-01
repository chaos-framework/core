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
  