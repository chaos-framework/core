import Component, { ComponentContainer } from '../../../src/EntityComponent/Component';
import Entity from '../../../src/EntityComponent/Entity';
import Action from '../../../src/Events/Action';
import AttachComponentAction from '../../../src/Events/Actions/AttachComponentAction';
import { Listener } from '../../../src/Events/Interfaces';
import Heal from '../Abilities/Heal';

export class Paladin extends Component implements Listener {
  name = 'Paladin';
  public = true;
  broadcast = true;
  tags = ['Class'];
  unique = true;

  attach(parent: ComponentContainer): void {
    this.parent = parent;
  }

  modify(a: Action) {
    
  }

  react(a: Action) {
    if(a instanceof AttachComponentAction && a.component === this) {
      
    }
  }

}
