import { v4 as uuid } from 'uuid';
import {
  ComponentContainer,
  Printable,
  Scope,
  Entity,
  AttachComponentAction,
  DetachComponentAction,
  Chaos,
  ActionHandler,
  Action
} from '../internal.js';

export abstract class Component<ParentType extends ComponentContainer = ComponentContainer>
  implements Printable {
  readonly id: string;
  data: { [key: string]: any };
  parent?: ParentType;
  readonly name: string = '';
  description?: string;
  tags = new Set<string>(); // usually frontend stuff, like filtering for traits vs statuses, etc
  public: boolean = false; // can other entities see this component? TODO: needed?
  broadcast: boolean = true; // do we tell client about this component at all?
  unique: boolean = true; // whether or not more of one of this type of class can be attached to an entity
  //propertyModifications: Modification[] = [];

  actionHandlers: Partial<Record<Scope | 'default', { [phase: string]: ActionHandler[] }>>;

  constructor({ id = uuid(), name = 'Unnamed Component', tags }: Component.ConstructorParams = {}) {
    this.id = id;
    this.name = this.name ? this.name : name;
    if (tags !== undefined) {
      this.tags = new Set<string>(tags);
    }
    this.data = {};
    this.actionHandlers ??= {};
  }

  print(): string {
    return this.name;
  }

  serialize(): object {
    return {
      id: this.id,
      name: this.name,
      data: this.data,
      broadcast: this.broadcast
    }; // TODO convert to json string?
  }

  unserialize(id: number, name: string, data: object) {}

  attach(
    { target, caster, using, metadata }: AttachComponentAction.ComponentParams,
    force = false
  ): AttachComponentAction {
    return new AttachComponentAction({ target, caster, component: this, using, metadata });
  }

  _attach(parent: ParentType) {
    this.parent = parent;
    if (this.parent.isPublished()) {
      Chaos.allComponents.set(this.id, this);
    }
  }

  detach(
    { target, caster, using, metadata }: DetachComponentAction.ComponentParams,
    force = false
  ): DetachComponentAction {
    return new DetachComponentAction({ target, caster, component: this, using, metadata });
  }

  _detach() {
    if (this.parent !== undefined) {
      this.parent.components.removeComponent(this);
      this.parent = undefined;
      Chaos.allComponents.delete(this.id);
    }
  }

  destroy(): boolean {
    // this.propertyModifications.map(mod => { mod.detach(); } );
    return true;
  }

  getParentEntity(): Entity | undefined {
    if (this.parent !== undefined) {
      if (this.parent instanceof Entity) {
        return this.parent;
      } else if (this.parent instanceof Component) {
        return this.parent.getParentEntity();
      }
    }
    return undefined;
  }

  serializeForClient(): Component.SerializedForClient {
    return {
      id: this.id,
      name: this.name,
      tags: Array.from(this.tags.values())
    };
  }

  _publish() {
    Chaos.allComponents.set(this.id, this);
  }

  _unpublish() {
    Chaos.allComponents.delete(this.id);
  }
}

export class DisplayComponent extends Component {}

// tslint:disable-next-line: no-namespace
export namespace Component {
  export interface ConstructorParams {
    id?: string;
    name?: string;
    tags?: string[];
  }

  export interface Serialized {}

  export interface SerializedForClient {
    id: string;
    name: string;
    tags: string[];
  }

  export function Deserialize(json: Component.Serialized): Component {
    throw new Error();
  }

  export function DeserializeAsClient(json: Component.SerializedForClient): Component {
    return new DisplayComponent(json);
  }
}
