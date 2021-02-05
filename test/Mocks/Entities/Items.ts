import { Entity, IEntity } from '../../../src/internal';
import { Sword, Silver } from '../Components/Properties';

export const createSilverSword = (): IEntity => {
  const e = new Entity({ name: "Test Entity" });
  e.attach({component: new Sword()}).execute();
  e.attach({component: new Silver()}).execute();
  return e;
}
