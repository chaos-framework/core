import Entity from "../EntityComponent/Entity";
import World from "../World/World";

export namespace Game {
  const worlds: Map<string, World> = new Map<string, World>();
  const entities: Map<number, Entity> = new Map<number, Entity>();

  export const getWorld = (id: string): World | undefined => {
    return worlds.get(id);
  }

  export const getEntity = (id: number): Entity | undefined => {
    return entities.get(id);
  }

  export const addEntity = (e: Entity): boolean => {
    if(e.id) {
      entities.set(e.id, e);
      return true;
    }
    return false;
  }

  // TODO players, teams
}
