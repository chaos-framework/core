import Entity from '../../../src/EntityComponent/Entity';

export const addRPGStats = (e: Entity) => {
  e._addProperty('HP'); // Hit Points
  e._addProperty('MA'); // Mana or Magic
};

export const addDNDStats = (e: Entity) => {
  e._addProperty('STR'); // Strength
  e._addProperty('DEX'); // Dexterity
  e._addProperty('CST'); // Constitution
  e._addProperty('INT'); // Intelligence
  e._addProperty('WIS'); // Wisdom
  e._addProperty('CHR'); // Charisma
};
