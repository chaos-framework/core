
import { v4 as uuid } from 'uuid';
import { ComponentScope, ComponentContainer, Printable } from '../internal'

export abstract class Component implements Printable {
  id: string;
  data: { [key: string]: any };
  parent?: ComponentContainer;
  name: string = '';
  tags = new Set<string>(); // usually frontend stuff, like filtering for traits vs statuses, etc
  public: boolean = false;    // can other entities see this component? TODO: needed?
  broadcast: boolean = false; // do we tell client about this component at all?
  unique: boolean = true;     // whether or not more of one of this type of class can be attached to an entity
  //propertyModifications: Modification[] = [];

  scope: ComponentScope = {};

  constructor({ id = uuid(), name = 'Unnamed Component', tags }: Component.ConstructorParams = {}) {
    this.id = id;
    this.name = this.name ? this.name : name;
    if(tags !== undefined) {
      this.tags = new Set<string>(tags);
    }
    this.data = {};
  }

  print(): string {
    return this.name;
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
    // this.propertyModifications.map(mod => { mod.detach(); } );
    return true;
  }

  serializeForClient(): Component.SerializedForClient {
    return {
      id: this.id,
      name: this.name,
      tags: Array.from(this.tags.values())
    }
  }

  unpublish() {
    // TODO any potential DB removals
  }
}

export class DisplayComponent extends Component {
}

// tslint:disable-next-line: no-namespace
export namespace Component {
  export interface ConstructorParams {
    id?: string,
    name?: string,
    tags?: string[]
  }

  export interface Serialized {

  }
  
  export interface SerializedForClient {
    id: string,
    name: string,
    tags: string[]
  }
  
  export function  Deserialize(json: Component.Serialized): Component  {
    throw new Error();
  }
  
  export function DeserializeAsClient(json: Component.SerializedForClient): Component {
    return new DisplayComponent(json);
  }
}
