import { expect } from 'chai';
import 'mocha';

import { Chaos } from '../../src/internal.js';

describe('Chaos Core', () => {
  it('Coalesces pre and post phases into complete list', () => {
    Chaos.setPrePhases(['pre']);
    Chaos.setPostPhases(['post']);
    expect(Chaos.getPhases()).to.include('pre');
    expect(Chaos.getPhases()).to.include('post');
    Chaos.setPhases(['one'], ['two']);
    expect(Chaos.getPhases()).to.include('one');
    expect(Chaos.getPhases()).to.include('two');
  });
});
