import { Component, Action, AttachComponentAction } from '../../../src/internal.js';

import { Heal } from '../Abilities/Spells';

export class Paladin extends Component {
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
