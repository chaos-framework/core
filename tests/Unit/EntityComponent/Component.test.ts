import Component from '../../../src/EntityComponent/Component';

class TestComponent extends Component {
    name = 'Test';

    constructor(parent?: any) {
        super(parent);
    }
}

test('IDs should be unique increment, starting with one', () => {
    let a = new TestComponent(null);
    let b = new TestComponent(null);
    expect(a.id === 1);
    expect(b.id === 1);
})

test('ID base can be reset', () => {
    Component.setIdCounter(0);
    let a = new TestComponent();
    Component.setIdCounter(9)
    let b = new TestComponent();
    expect(a.id === 1);
    expect(b.id === 11);
})

test('TestComponent keeps its name', () => {
    let a = new TestComponent();
    expect(a.name === 'Test');
})
