import Entity from '../../../src/EntityComponent/Entity';

test('IDs should be unique increment, starting with one', () => {
    let a = new Entity();
    let b = new Entity();
    expect(a.id === 1);
    expect(b.id === 2);
})

test('ID base can be reset', () => {
    Entity.setIdCounter(0);
    let a = new Entity();
    Entity.setIdCounter(9)
    let b = new Entity();
    expect(a.id === 1);
    expect(b.id === 11);
})