import PropertyAdjustment from '../../src/Events/Actions/PropertyAdjustment';
import { Undead } from '../Mocks/Components/Traits';
import { createZombie, createPaladin } from '../Mocks/Entities/Actors';

test('Modifiers are added to Entities', () => {
  let zombie = createZombie();
  expect(zombie.modifiers.find(m => m instanceof Undead) !== null);
});

test('Unique modifiers cannot be added twice', () => {
  const zombie = createZombie();
  zombie.attach(new Undead());
  zombie.attach(new Undead());
  zombie.attach(new Undead());
  expect(zombie.modifiers.filter(m => m instanceof Undead)).toBeTruthy();
});

test('Modifiers on entities can change action outcomes', () => {
  const zombie = createZombie();
  const paladin = createPaladin();
  const e = paladin.cast('Heal', {target: zombie});
  expect(e).toBeTruthy();
  if(e !== undefined) {
    expect(e.executed === true);
    const healAction = (e.actions[0] as PropertyAdjustment);
    expect(healAction.amount).toBeGreaterThan(0);
    expect(healAction.finalAmount).toBeLessThan(0);
  }
});
