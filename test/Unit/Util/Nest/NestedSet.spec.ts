import { expect } from 'chai';
import 'mocha';

import { NestedSet } from '../../../../src/internal.js';

describe.only('NestedSet', () => {
  describe('Without nesting', () => {
    let unnested: NestedSet;
    const id = 'solo';
    const level = 'level is irrelevent';
    beforeEach(() => {
      unnested = new NestedSet(id, level);
    })

    it('Can add individual entries.', () => {
      unnested.add('1');
      unnested.add('2');
      unnested.add('3');
      unnested.add('3'); // redundant test
      expect(unnested.has('1')).to.be.true;
      expect(unnested.has('2')).to.be.true;
      expect(unnested.has('3')).to.be.true;
    });

    it('Can remove individual entries.', () => {
      unnested.add('1');
      unnested.add('2');
      unnested.remove('1');
      expect(unnested.has('1')).to.be.false;
      expect(unnested.has('2')).to.be.true;
    });

    it('Tracks changes for individual additions.', () => {
      let changes = unnested.add('1');
      expect(changes.changes[level]).to.exist;
      expect(changes.changes[level]![id]).to.exist;
      expect(changes.changes[level]![id]).to.contain('1');
    });

    it('Tracks changes for individual subtractions.', () => {
      unnested.add('1');
      let changes = unnested.remove('1');
      expect(changes.changes[level]).to.exist;
      expect(changes.changes[level]![id]).to.exist;
      expect(changes.changes[level]![id]).to.contain('1');
    });

    it.skip('Tracks changes for multiple additions.', () => {

    });

    it.skip('Tracks changes for multiple subtractions.', () => {

    });
  });

  describe('With nesting', () => {
    /*
    *          initial setup
    *   top             0           1
    *   middle        0   1       1   2
    *   leaf         0 1  1       -  2 3
    *   [entries]   ab bc -       -  d efgh
    */

    let top: NestedSet[];
    let middle: NestedSet[];
    let leaf: NestedSet[];
    beforeEach(() => {
      top = [];
      middle = [];
      leaf = [];
      // Push nodes
      for(let i = 0; i <= 1; i++) {
        top.push(new NestedSet(i.toString(), 'top'));
      }
      for(let i = 0; i <= 2; i++) {
        middle.push(new NestedSet(i.toString(), 'middle'));
      }
      for(let i = 0; i <= 3; i++) {
        leaf.push(new NestedSet(i.toString(), 'leaf'));
      }
      // Add entries to children
      leaf[0].add('a');
      leaf[0].add('b');
      leaf[1].add('b');
      leaf[1].add('c');
      leaf[2].add('d');
      leaf[3].add('e');
      leaf[3].add('f');
      leaf[3].add('g');
      leaf[3].add('h');
      // Start linking the nodes, bottom-to-top
      middle[0].addChild(leaf[0]);
      middle[0].addChild(leaf[1]);
      middle[1].addChild(leaf[1]);
      middle[2].addChild(leaf[2]);
      middle[2].addChild(leaf[3]);
      top[0].addChild(middle[0]);
      top[0].addChild(middle[1]);
      top[1].addChild(middle[1]);
      top[1].addChild(middle[2]);
    });

    it("Should ensure all top and middle nodes contain their child nodes' entries", () => {
      // Check top nodes
      expect(top[0].has('a')).to.be.true;
      expect(top[0].has('b')).to.be.true;
      expect(top[0].has('c')).to.be.true;
      expect(top[0].has('d')).to.be.false;
      expect(top[1].has('a')).to.be.false;
      expect(top[1].has('b')).to.be.true;
      expect(top[1].has('c')).to.be.true;
      expect(top[1].has('d')).to.be.true;
      expect(top[1].has('e')).to.be.true;
      expect(top[1].has('f')).to.be.true;
      expect(top[1].has('g')).to.be.true;
      // Check middle nodes
      expect(middle[0].has('a')).to.be.true;
      expect(middle[0].has('b')).to.be.true;
      expect(middle[0].has('c')).to.be.true;
      expect(middle[0].has('d')).to.be.false;
      expect(middle[1].has('a')).to.be.false;
      expect(middle[1].has('b')).to.be.true;
      expect(middle[1].has('c')).to.be.true;
      expect(middle[2].has('a')).to.be.false;
      expect(middle[2].has('c')).to.be.false;
      expect(middle[2].has('d')).to.be.true;
      expect(middle[2].has('e')).to.be.true;
    });

    it('Can add a new leaf and track changes for new entries', () => {
      const newLeaf = new NestedSet('new', 'leaf');
      newLeaf.add('a');  // should NOT be new to middle or top
      newLeaf.add('z');  // SHOULD be new to middle and top
      const change = middle[0].addChild(newLeaf);
      expect(change.changes['middle']['0'].has('a')).to.be.false;
      expect(change.changes['middle']['0'].has('z')).to.be.true;
      expect(change.changes['top']['0'].has('a')).to.be.false;
      expect(change.changes['top']['0'].has('z')).to.be.true;
    });

    it('Can remove a leaf and track changes', () => {
      const change = middle[0].removeChild('0');
      // Should remove 'a' but not 'b' from middle since it is shared by leaf '1'
      expect(change.changes['middle']['0'].has('a')).to.be.true;
      expect(change.changes['middle']['0'].has('b')).to.be.false;
      // Same with top
      expect(change.changes['top']['0'].has('a')).to.be.true;
      expect(change.changes['top']['0'].has('b')).to.be.false;
    });

    it('Can add a leaf entry and track changes', () => {
      // Add leaf entry and cache the changes
      let cached = leaf[1].add('z');
      expect(cached.changes['leaf']['1'].has('z')).to.be.true;
      expect(cached.changes['middle']['0'].has('z')).to.be.true;
      expect(cached.changes['middle']['1'].has('z')).to.be.true;
      expect(cached.changes['middle']['2']).to.not.exist;
      expect(cached.changes['top']['0'].has('z')).to.be.true;
      expect(cached.changes['top']['1'].has('z')).to.be.true;
    });

    it('Can remove a leaf entry and track changes at appropriate levels', () => {
      // Remove a leaf entry and cache the changes
      let cached = leaf[0].remove('a');
      expect(cached.changes['leaf']['0']?.has('a')).to.be.true;
      expect(cached.changes['middle']['0']?.has('a')).to.be.true;
      expect(cached.changes['top']['0']?.has('a')).to.be.true;
      expect(cached.changes['leaf']['1']).to.not.exist;
      expect(cached.changes['middle']['1']).to.not.exist;
      expect(cached.changes['top']['1']).to.not.exist;
    });
  
    it('Can add multiple entries and track them in one large change', function () {
      const set = new Set<string>(['x', 'y', 'z']);
      let changes = leaf[2].addSet(set);
      expect(changes.changes['leaf']['2']).to.contain('x');
      expect(changes.changes['leaf']['2']).to.contain('y');
      expect(changes.changes['middle']['2']).to.contain('x');
      expect(changes.changes['middle']['2']).to.contain('y');
      expect(changes.changes['top']['1']).to.contain('x');
      expect(changes.changes['top']['1']).to.contain('y');
    });
  
    it('Can remove multiple entries and track them in one large change', function () {
      const set = new Set<string>(['e', 'f']);
      let changes = leaf[3].removeSet(set);
      expect(changes.changes['leaf']['3']).to.contain('e');
      expect(changes.changes['leaf']['3']).to.contain('f');
      expect(changes.changes['middle']['2']).to.contain('e');
      expect(changes.changes['middle']['2']).to.contain('f');
      expect(changes.changes['top']['1']).to.contain('e');
      expect(changes.changes['top']['1']).to.contain('f');
    });

  });
});
