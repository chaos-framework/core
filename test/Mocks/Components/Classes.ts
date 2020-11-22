import Component, { ComponentContainer } from '../../../src/EntityComponent/Component';
import Entity from '../../../src/EntityComponent/Entity';
import Action from '../../../src/Events/Action';
import { AttachComponentAction } from '../../../src/Events/Actions/ComponentActions';
import { Listener, Reacter } from '../../../src/Events/Interfaces';
import Heal from '../Abilities/Heal';

export class Paladin extends Component implements Reacter {
  name = 'Paladin';
  public = true;
  broadcast = true;
  tags = ['Class'];
  unique = true;

  react(a: Action) {
    if(a instanceof AttachComponentAction && a.component === this) {
      a.react(a.target.grant({ ability: new Heal() }));
      // TODO add INT buff
    }
  }

}
