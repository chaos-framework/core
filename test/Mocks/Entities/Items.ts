import { Entity } from '../../../src/internal.js';
import { Sword, Silver } from '../Components/Properties';

export const createSilverSword = (): Entity => {
  const e = new Entity({ name: "Test Entity" });
  e.attach({component: new Sword()}).execute();
  e.attach({component: new Silver()}).execute();
  return e;
}
