import Value from '../Value';
import Modifier, { ModifierType } from '../Modifier';

test('Value construction.', () => {
    let v: Value<number> = new Value(10);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);
})

test('Value setting.', () => {
    let v: Value<number> = new Value(10);
    v.set(20);
    expect(v._base).toBe(20);
    expect(v._calculated).toBe(20);
    v.set(10);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);
})

test('Value adjustment.', () => {
    // TODO
})

test('Value modification - set', () => {
    let v: Value<number> = new Value(10);

    // Add and remove single modifier
    let m: Modifier<number> = new Modifier(ModifierType.Set, 123);
    v.apply(m);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(123);
    v.remove(m);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);

    // Add multiple -- output should be last applied
    v.apply(m);
    let m2: Modifier<number> = new Modifier(ModifierType.Set, 234);
    v.apply(m2);
    expect(v._calculated).toBe(234);
    v.remove(m2);
    expect(v._calculated).toBe(123);
    v.remove(m);
    expect(v._calculated).toBe(10);
})
