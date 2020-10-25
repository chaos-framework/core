import Entity from '../../../src/EntityComponent/Entity';
import Physical from '../Components/Physical';
import Paladin from '../Components/Classes/Paladin';
import Undead from '../Components/Traits/Undead';

export function createPaladin(): Entity {
  const e = new Entity();
  e.attach(new Physical(50));
  e.attach(new Paladin()); // also grants heal

  return e;
}

export function createZombie(): Entity {
  const e = new Entity();
  e.attach(new Physical(40));
  e.attach(new Undead());
  return e;
}