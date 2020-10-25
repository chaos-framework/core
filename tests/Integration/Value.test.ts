import Value from '../../src/EntityComponent/Value';
import { ModificationType, Modification } from '../../src/EntityComponent/Modification';

test('Numeric value construction.', () => {
    let v = new Value(10);
    expect(v.base).toBe(10);
    expect(v.calculated).toBe(10);
})

test('Numeric value setting.', () => {
    let v = new Value(10);
    v.set(20);
    expect(v.base).toBe(20);
    expect(v.calculated).toBe(20);
    v.set(10);
    expect(v.base).toBe(10);
    expect(v.calculated).toBe(10);
})

test('Numeric value modification - adjust', () => {
    let v = new Value(10);

    // Add and remove single modifier
    let m = new Modification(10);
    v.apply(m);
    expect(v.base).toBe(10);
    expect(v.calculated).toBe(20);
    v.remove(m);
    expect(v.base).toBe(10);
    expect(v.calculated).toBe(10);

    // Add multiple -- output should be both combined
    let m2 = new Modification(20);
    v.apply(m);
    v.apply(m2);
    expect(v.calculated).toBe(40);
    v.remove(m2);
    expect(v.calculated).toBe(20);
    v.remove(m);
    expect(v.calculated).toBe(10);
})

test('Numeric value modification - set', () => {
    let v = new Value(10);

    // Add and remove single modifier
    let m = new Modification(123, ModificationType.Set);
    v.apply(m);
    expect(v.base).toBe(10);
    expect(v.calculated).toBe(123);
    v.remove(m);
    expect(v.base).toBe(10);
    expect(v.calculated).toBe(10);

    // Add multiple -- output should be last applied
    v.apply(m);
    let m2 = new Modification(234, ModificationType.Set);
    v.apply(m2);
    expect(v.calculated).toBe(234);
    v.remove(m2);
    expect(v.calculated).toBe(123);
    v.remove(m);
    expect(v.calculated).toBe(10);
})
