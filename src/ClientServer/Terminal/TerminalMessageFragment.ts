import { deserialize } from "v8";
import { Component, Entity, Printable } from "../../internal";

// tslint:disable-next-line: max-classes-per-file

export class TerminalMessageFragment {
  type: 'entity' | 'component';

  constructor(public item: Printable, public replacement?: string) {
    if (item instanceof Entity) {
      this.type = 'entity';
    } else if (item instanceof Component) {
      this.type = 'component';
    } else {
      this.type = 'entity';
    }
  }

  print(): string {
    return this.replacement ?? this.item.print();
  }

  serialize(): any {
    return {
      type: this.type,
      item: this.serializeItem()
    }
  }

  serializeItem(): any {
    switch(this.type) {
      case 'entity':
        return (this.item as Entity).id;
      case 'component':
        return (this.item as Component).id;
    }
  }
}

// tslint:disable-next-line: no-namespace
export namespace TerminalMessageFragment {
  export function deserialize(json: any) {

  }
}
