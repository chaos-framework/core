import Entity from '../../src/Entity'
import Physical from './Components/Physical'

export const warrior = new Entity();
warrior.addTrait(new Physical(20));
