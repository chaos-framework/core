import Component from '../../../src/EntityComponent/Component';
import Action from '../../../src/Events/Action';
import { Listener, Modifier } from '../../../src/Events/Interfaces';
import { PropertyAdjustmentAction } from '../../../src/Events/Actions/PropertyActions';
import { EquipAction } from '../../../src/Events/Actions/EquipmentActions';
import { Slash, Stab } from '../Abilities/Attacks';

export class Sword extends Component implements Listener {
  name = "Sword";
  public = true;
  broadcast = true;
  tags = ['Property'];
  unique = true;

  modify(a: Action) {
    if(a instanceof EquipAction && a.item === this.parent && a.slot.toLowerCase().includes('hand')) {
      a.permit(); // allow this action
    }
  };

  react(a: Action) {
    if(a instanceof EquipAction && a.item === this.parent && a.slot.toLowerCase().includes('hand')) {
      // TODO add slash and hack abilities to target
      a.target.grant({ ability: new Slash(), using: this, grantedBy: this });
      a.target.grant({ ability: new Stab(), using: this, grantedBy: this });
    }
  };

}

export class Iron extends Component implements Modifier {
  public = true;
  broadcast = true;
  tags = ['Property'];
  unique = true;

  // Iron does a bit more damage than, say, wood
  modify(a: Action) {
    if(a.using === this.parent && a instanceof PropertyAdjustmentAction && a.is('Attack') && a.property === 'HP' && a.amount < 0) {
      a.multiply(1.1);
    }
  }
}

export class Silver extends Component implements Modifier {
  public = true;
  broadcast = true;
  tags = ['Property'];
  unique = true;

  // Silver does a lot of damage, and even more to beasts
  modify(a: Action) {
    if(a.using === this.parent && a instanceof PropertyAdjustmentAction && a.is('Attack') && a.property === 'HP' && a.amount < 0) {
      a.multiply(1.3);
      if(a.target && a.target.is("Beast")) {
        a.multiply(1.1);
      }
    }
  }
}
