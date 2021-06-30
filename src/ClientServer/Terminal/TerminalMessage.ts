import { Printable, isPrintable, TerminalMessageFragment } from "../../internal";

export class TerminalMessage {
  channel?: string;
  fragments: (string | TerminalMessageFragment)[] = [];

  constructor(...items: (string | Printable | TerminalMessageFragment | undefined)[]) {
    for(const item of items) {
      if(item !== undefined) {
        if(!(item instanceof TerminalMessageFragment) && isPrintable(item)) {
          this.fragments.push(new TerminalMessageFragment(item));
        } else {
          this.fragments.push(item);
        }
      }
    }
  }

  print(): string {
    const strings = [];
    for (const fragment of this.fragments) {
      strings.push(fragment instanceof TerminalMessageFragment ? fragment.print() : fragment);
    }
    return strings.join(' ');
  }

}
