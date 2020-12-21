import Entity from "../EntityComponent/Entity";
import World from "../World/World";

export default abstract class Game {
  name = "Default Game";
  worlds: Map<string, World> = new Map<string, World>();
  entities: Map<number, Entity> = new Map<number, Entity>();
  // TODO players, teams

  getWorld = (id: string): World | undefined => {
    return this.worlds.get(id);
  }

  getEntity = (id: number): Entity | undefined => {
    return this.entities.get(id);
  }

  addEntity = (e: Entity): boolean => {
    if(e.id) {
      this.entities.set(e.id, e);
      return true;
    }
    return false;
  }

  // abstract classes..
    // playerConnect, other callbacks

}
