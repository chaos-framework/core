import Component from '../../../../src/EntityComponent/Component';
import { Modifier } from '../../../../src/Events/Interfaces';
import Action, { PropertyAdjustment } from '../../../../src/Events/Action'

export default class Undead extends Component implements Modifier {
  name = "Undead";
  public = true;
  broadcast = true;
  tags = ['trait'];
  unique = true;

  modify(a: Action) {
    if (a instanceof PropertyAdjustment && a.effects('HP')) {
      if ((a.is('heal') && a.amount > 0) || (a.is('poison') && a.amount < 0)) {
        a.multiply(-1, ['undead'], true);
      }
    }
  }
  
}
