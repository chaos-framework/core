import Entity from '../../../src/EntityComponent/Entity';
import Physical from '../Components/Physical';
import { Paladin } from '../Components/Classes';
import { Undead } from '../Components/Traits';

export function createPaladin(): Entity {
  const e = new Entity();
  e.attach(new Physical(50)).execute();
  e.attach(new Paladin()); // also grants heal
  e.equip(new Sword).execute();

  return e;
}

export function createZombie(): Entity {
  const e = new Entity();
  e.attach(new Physical(40));
  e.attach(new Undead());
  return e;
}