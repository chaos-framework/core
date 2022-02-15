export class EntityScope {
  visibleEntities = new Set<string>();  // which entities this viewer can see
  entitiesWithSight = new Map<string, Set<string>>(); // which of this viewer's entities (V) are seeing each entity (K)

  // View entity, returning true if newly percieved
  gainSightOfEntity(entityId: string, viewerId?: string): boolean {
    // If we're tracking vision on an entity-level..
    if(viewerId !== undefined) {
      let viewers = this.entitiesWithSight.get(entityId);
      if(viewers === undefined) {
        viewers = new Set<string>();
        viewers.add(viewerId);
        this.entitiesWithSight.set(entityId, viewers);
      } else {
        viewers.add(viewerId);
      }
    }
    const previouslyVisible = this.visibleEntities.has(entityId);
    this.visibleEntities.add(entityId);
    return !previouslyVisible;
  }

  // Lose sight of entity, returning true if this viewer can no longer see the entity by any means
  loseSightOfEntity(entityId: string, viewerId?: string): boolean {
    if(viewerId !== undefined) {
      const viewers = this.entitiesWithSight.get(entityId);
      if(viewers !== undefined) {
        viewers.delete(viewerId);
        if(viewers.size === 0) {
          this.visibleEntities.delete(entityId);
          this.entitiesWithSight.delete(entityId);
          return true;
        } else {
          return false;
        }
      } else {
        return true;  // strange case, deleting an entity that was never viewed?
      }
    } else {
      this.visibleEntities.delete(entityId);
      this.entitiesWithSight.delete(entityId);
      return true;
    }
  }

  sees(entityId: string) {
    return this.visibleEntities.has(entityId);
  }

}