import { expect } from 'chai';
import 'mocha';

import { NestedMap, NestedChanges } from '../../../../src/internal.js';

describe('NestedMap', () => {
  describe('Without nesting', () => {
    let unnested: NestedMap<number>;
    const id = 'solo';
    const level = 'level is irrelevent';
    beforeEach(() => {
      unnested = new NestedMap<number>(id, level);
    })

    it('Can add individual entries.', () => {
      unnested.add('1', 1);
      unnested.add('2', 2);
      unnested.add('3', 3);
      unnested.add('3', 3); // redundant test
      unnested.add('test', 4);
      unnested.add('test', 5); // overwrite test
      expect(unnested.get('1')).to.equal(1);
      expect(unnested.get('2')).to.equal(2);
      expect(unnested.get('3')).to.equal(3);
      expect(unnested.get('test')).to.equal(5);
    });

    it('Can remove individual entries.', () => {
      unnested.add('1', 1);
      unnested.add('2', 2);
      unnested.remove('1');
      expect(unnested.get('1')).to.be.undefined;
      expect(unnested.get('2')).to.equal(2);
    });

    it('Tracks changes for individual additions.', () => {
      let changes = unnested.add('1', 1);
      expect(changes.added[level]).to.exist;
      expect(changes.added[level]![id]).to.exist;
      expect(changes.added[level]![id]).to.contain('1');
    });

    it('Tracks changes for individual subtractions.', () => {
      unnested.add('1', 1);
      let changes = unnested.remove('1');
      expect(changes.removed[level]).to.exist;
      expect(changes.removed[level]![id]).to.exist;
      expect(changes.removed[level]![id]).to.contain('1');
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

    let top: NestedMap<string>[];
    let middle: NestedMap<string>[];
    let leaf: NestedMap<string>[];
    beforeEach(() => {
      top = [];
      middle = [];
      leaf = [];
      // Push nodes
      for(let i = 0; i <= 1; i++) {
        top.push(new NestedMap<string>(i.toString(), 'top'));
      }
      for(let i = 0; i <= 2; i++) {
        middle.push(new NestedMap<string>(i.toString(), 'middle'));
      }
      for(let i = 0; i <= 3; i++) {
        leaf.push(new NestedMap<string>(i.toString(), 'leaf'));
      }
      // Add entries to children
      leaf[0].add('a', 'a');
      leaf[0].add('b', 'b');
      leaf[1].add('b', 'b');
      leaf[1].add('c', 'c');
      leaf[2].add('d', 'd');
      leaf[3].add('e', 'e');
      leaf[3].add('f', 'f');
      leaf[3].add('g', 'g');
      leaf[3].add('h', 'h');
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
      const newLeaf = new NestedMap<string>('new', 'leaf');
      newLeaf.add('a', 'a');  // should NOT be new to middle or top
      newLeaf.add('z', 'z');  // SHOULD be new to middle and top
      const change = middle[0].addChild(newLeaf);
      expect(change.added['middle']['0'].has('a')).to.be.false;
      expect(change.added['middle']['0'].has('z')).to.be.true;
      expect(change.added['top']['0'].has('a')).to.be.false;
      expect(change.added['top']['0'].has('z')).to.be.true;
    });

    it('Can remove a leaf and track changes', () => {
      const change = middle[0].removeChild('0');
      // Should remove 'a' but not 'b' from middle since it is shared by leaf '1'
      expect(change.removed['middle']['0'].has('a')).to.be.true;
      expect(change.removed['middle']['0'].has('b')).to.be.false;
      // Same with top
      expect(change.removed['top']['0'].has('a')).to.be.true;
      expect(change.removed['top']['0'].has('b')).to.be.false;
    });

    it('Can add a leaf entry and track changes', () => {
      // Add leaf entry and cache the changes
      let cached = leaf[1].add('z', 'z');
      expect(cached.added['leaf']['1'].has('z')).to.be.true;
      expect(cached.added['middle']['0'].has('z')).to.be.true;
      expect(cached.added['middle']['1'].has('z')).to.be.true;
      expect(cached.added['middle']['2']).to.not.exist;
      expect(cached.added['top']['0'].has('z')).to.be.true;
      expect(cached.added['top']['1'].has('z')).to.be.true;
    });

    it('Can remove a leaf entry and track changes at appropriate levels', () => {
      // Remove a leaf entry and cache the changes
      let cached = leaf[0].remove('a');
      expect(cached.removed['leaf']['0']?.has('a')).to.be.true;
      expect(cached.removed['middle']['0']?.has('a')).to.be.true;
      expect(cached.removed['top']['0']?.has('a')).to.be.true;
      expect(cached.removed['leaf']['1']).to.not.exist;
      expect(cached.removed['middle']['1']).to.not.exist;
      expect(cached.removed['top']['1']).to.not.exist;
    });

  });
});
