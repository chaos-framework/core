import { v4 as uuid } from 'uuid';
import Modification from "./Properties/Modification";

export default abstract class Component {
  id: string;
  data: { [key: string]: any };
  parent?: ComponentContainer;
  name?: string;
  tags: string[] = []; // usually frontend stuff, like filtering for traits vs statuses, etc
  scope: "Entity" | "World" | "Game" = "Entity";
  public: boolean = false;    // can other entities see this component? TODO: needed?
  broadcast: boolean = false; // do we tell client about this component at all?
  unique: boolean = true;     // whether or not more of one of this type of class can be attached to an entity
  propertyModifications: Modification[] = [];

  constructor() {
    this.id = uuid();
    this.data = {};
  }

  serialize(): object {
    return { id: this.id, name: this.name, data: this.data } // TODO convert to json string?
  }

  unserialize(id: number, name: string, data: object) {

  }

  attach(parent: ComponentContainer) {
    this.parent = parent;
  }

  detach() {

  }

  destroy(): boolean {
    this.propertyModifications.map(mod => { mod.detach(); } );
    return true;
  }
}

export interface ComponentContainer {
  components: Component[];
}