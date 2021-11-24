import { Entity } from '../../../src/internal.js';
import { Paladin } from '../Components/Classes';
import { Humanoid, Physical, Undead } from '../Components/Traits';
import { createSilverSword } from '../Entities/Items';
import Property from '../../../src/EntityComponent/Properties/Property';
import Value from '../../../src/EntityComponent/Properties/Value';

const addRPGStats = (e: Entity, maxHp: number, maxMa: number): Entity => {
  e._addProperty('HP', maxHp, undefined, maxHp); // Hit Points
  e._addProperty('MA', maxMa, undefined, maxMa); // Mana or Magic
  return e;
};

const addDNDStats = (e: Entity, { str, dex, cst, int, wis, chr }: { str?: number, dex?: number, cst?: number, int?: number, wis?: number, chr?: number } = {}): Entity => {
  e._addProperty('STR'); // Strength
  e._addProperty('DEX'); // Dexterity
  e._addProperty('CST'); // Constitution
  e._addProperty('INT'); // Intelligence
  e._addProperty('WIS'); // Wisdom
  e._addProperty('CHR'); // Charisma
  return e;
};

const createHuman = (weight = 20): Entity => {
  const e = new Entity({ name: "Bob" });
  e.attach({ component: new Physical(weight) }, true).execute();
  e.attach({ component: new Humanoid() }, true).execute();
  return e;
}

export function createPaladin(): Entity {
  const e = createHuman();
  addRPGStats(e, 20, 20);
  addDNDStats(e, {
    str: 10,
    dex: 8,
    cst: 10,
    int: 10,
    wis: 10,
    chr: 7,
  });
  e.attach({ component: new Paladin() }, true).execute(); // also grants Heal
  e.equip({ item: createSilverSword(), slot: "R. Hand" }, true).execute(); // also grants Heal
  return e;
}

export function createZombie(): Entity {
  const e = createHuman();
  addRPGStats(e, 10, 10);
  addDNDStats(e, {
    str: 14,
    dex: 2,
    cst: 2,
    int: 1,
    wis: 0,
    chr: 0,
  });
  e.attach({ component: new Undead() }).execute();
  return e;
}

// export function createZombie(): Entity {
//   const e = new Entity();
//   e.attach(new Physical(40));
//   e.attach(new Undead());
//   return e;
// }