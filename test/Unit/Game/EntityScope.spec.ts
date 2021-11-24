import { expect } from 'chai';
import 'mocha';

import { EntityScope } from '../../../src/internal.js';

describe('EntityScope', () => {
  let scope: EntityScope;
  beforeEach(() => {
    scope = new EntityScope();
  });

  it('Can add seen entities with viewer IDs', () => {
    scope.gainSightOfEntity('a', '1');
    scope.gainSightOfEntity('a', '2');
    scope.gainSightOfEntity('b', '1');
    expect(scope.sees('a')).to.be.true;
    expect(scope.sees('b')).to.be.true;
    expect(scope.sees('c')).to.be.false;
  })

  it('Can remove seen entities', () => {
    scope.gainSightOfEntity('a', 'v');
    scope.loseSightOfEntity('a', 'v');
    expect(scope.sees('a')).to.be.false;
  })

  it('Will keep sight of entities if until all viewers lose sight', () => {
    scope.gainSightOfEntity('a', '1');
    scope.gainSightOfEntity('a', '2');
    scope.loseSightOfEntity('a', '1');
    expect(scope.sees('a')).to.be.true;
    scope.loseSightOfEntity('a', '2');
    expect(scope.sees('a')).to.be.false;
  })

});