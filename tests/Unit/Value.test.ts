import Value from '../../src/EntityComponent/Value';

test('Value construction', () => {
    let v = new Value(50);
    expect(v.base === 50);
});

test('Value setting', () => {
    let v = new Value(50);
    v.set(10);
    expect(v.base === 10);
});

test('Value adjustment', () => {
    let v = new Value(50);
    v.adjust(10);
    expect(v.base === 60);
});