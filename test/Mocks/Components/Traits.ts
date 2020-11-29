import Component from '../../../src/EntityComponent/Component';
import { Listener, Modifier } from '../../../src/Events/Interfaces';
import Action from '../../../src/Events/Action';
import { AttachComponentAction } from '../../../src/Events/Actions/ComponentActions';
import { PropertyChangeAction } from '../../../src/Events/Actions/PropertyActions';

export class Physical extends Component implements Listener {

  constructor(public weight: number) {
    super();
  }

  modify(a: Action) {
  }

  react(a: Action) {
  }
}

export class Humanoid extends Component implements Listener {
  name = 'Humanoid';
  tags = ['body'];
  static readonly slots: Array<string> = ['Head', 'Neck', 'Torso', 'Hands', 'R. Hand', 'R. Finger', 'L. Hand', 'L. Finger', 'Legs', 'Feet'];

  modify(a: Action) {

  }

  react(a: Action) {
    // Add human slots
    if(a instanceof AttachComponentAction && a.component === this) {
      Humanoid.slots.map(slot => {
        a.react(a.target.addSlot({name: slot}));
      })
    }
  }
}

export class Undead extends Component implements Modifier {
  name = "Undead";
  public = true;
  broadcast = true;
  tags = ['trait'];

  modify(a: Action) {
    if(a instanceof PropertyChangeAction && a.increases('HP')) {
      a.multiply(-1, this, [this.name]);  // Note that the last param drops a breadcrumb and ensures another Undead hasn't run
    }
  }
  
}
