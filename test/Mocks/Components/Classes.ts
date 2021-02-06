import { Component, Action, AttachComponentAction,
  Reacter} from '../../../src/internal';

import { Heal } from '../Abilities/Spells';

export class Paladin extends Component implements Reacter {
  name = 'Paladin';
  public = true;
  broadcast = true;
  tags = new Set<string>(['class']);
  unique = true;

  react(a: Action) {
    if(a instanceof AttachComponentAction && a.component === this) {
      a.react(a.target.learn({ ability: new Heal() }));
      // TODO add INT buff
    }
  }

}
