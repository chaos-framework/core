import { createPaladin } from '../Mocks/Entities/Actors';

test('Components can grant abilities.', () => {
  let paladin = createPaladin();
  expect(paladin.abilities['Heal'] !== null);
});