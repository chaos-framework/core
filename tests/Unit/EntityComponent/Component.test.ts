import Component from '../../../src/EntityComponent/Component';

class TestComponent extends Component {
    name = 'Test';

    constructor() {
        super();
    }
}

test('IDs should be unique increment, starting with one', () => {
    let a = new TestComponent();
    let b = new TestComponent();
    expect(a.id === 1);
    expect(b.id === 2);
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
