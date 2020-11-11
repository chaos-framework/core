import Component, { ComponentContainer } from '../../../src/EntityComponent/Component';
import Entity from '../../../src/EntityComponent/Entity';
import Heal from '../Abilities/Heal';

export class Paladin extends Component {
  name = 'Paladin';
  public = true;
  broadcast = true;
  tags = ['Class'];
  unique = true;

  attach(parent: ComponentContainer): void {
    this.parent = parent;
    if(parent instanceof Entity) {
      parent.grant(new Heal(), this);
    }
  }

}
