import Entity from '../../../src/EntityComponent/Entity';
import { Sword, Silver } from '../Components/Properties';

export const createSilverSword = (): Entity => {
  const e = new Entity();
  e.attach({component: new Sword()}).execute();
  e.attach({component: new Silver()}).execute();
  return e;
}
