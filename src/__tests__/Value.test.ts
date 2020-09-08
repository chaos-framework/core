import { NumericValue } from '../Value';
import { NumericModifier, ModifierType } from '../Modifier';

test('Numeric value construction.', () => {
    let v = new NumericValue(10);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);
})

test('Numeric value setting.', () => {
    let v = new NumericValue(10);
    v.set(20);
    expect(v._base).toBe(20);
    expect(v._calculated).toBe(20);
    v.set(10);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);
})


test('Numeric value modification - adjust', () => {
    let v = new NumericValue(10);

    // Add and remove single modifier
    let m = new NumericModifier(10);
    v.apply(m);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(20);
    v.remove(m);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);

    // Add multiple -- output should be both combined
    let m2 = new NumericModifier(20);
    v.apply(m);
    v.apply(m2);
    expect(v._calculated).toBe(40);
    v.remove(m2);
    expect(v._calculated).toBe(20);
    v.remove(m);
    expect(v._calculated).toBe(10);
})

test('Numeric value modification - set', () => {
    let v = new NumericValue(10);

    // Add and remove single modifier
    let m = new NumericModifier(123, ModifierType.Set);
    v.apply(m);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(123);
    v.remove(m);
    expect(v._base).toBe(10);
    expect(v._calculated).toBe(10);

    // Add multiple -- output should be last applied
    v.apply(m);
    let m2 = new NumericModifier(234, ModifierType.Set);
    v.apply(m2);
    expect(v._calculated).toBe(234);
    v.remove(m2);
    expect(v._calculated).toBe(123);
    v.remove(m);
    expect(v._calculated).toBe(10);
})
