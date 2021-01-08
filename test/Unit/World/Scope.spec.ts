import { expect } from 'chai';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import 'mocha';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import { Entity, Game, Scope, Vector } from './../../../src/';

describe ('Scopes', () => {
  let scope: Scope;
  let game: Game;
  beforeEach(() => {
    game = new EmptyGame();
    scope = new Scope(256, 256);
  });

  it('Views nothing by default', () => {
    expect(scope.active.size).to.equal(0);
  });

  it('Can add viewers, returns a scopechange', () => {
    game.viewDistance = 0;
    const v = new Vector(0, 0);
    const key = v.getIndexString();
    const id = '';
    const change = scope.addViewer(id, v);
    expect(change).to.not.be.null;
    expect(change.added.length).to.be.greaterThan(0);
    expect(change.added[0]).to.equal(key);
    expect(scope.active.has(key)).to.be.true;
    const viewers = scope.chunkViewers.get(key);
    expect(viewers).to.not.equal(undefined);
    expect(viewers!.has(id)).to.be.true;
  });

  it('Can add multiple viewers, which adds new references but does not increase scope', () => {
    game.viewDistance = 0;
    const v = new Vector(0, 0);
    const key = v.getIndexString();
    scope.addViewer('1', v);
    const change = scope.addViewer('2', v);
    expect(change.added.length).to.equal(0);
    const viewers = scope.chunkViewers.get(key);
    expect(viewers!.has('1')).to.be.true;
    expect(viewers!.has('2')).to.be.true;
  });

  it('Can remove viewers, which keeps chunks with other viewers active', () => {
    game.viewDistance = 0;
    const v = new Vector(0, 0);
    const key = v.getIndexString();
    scope.addViewer('1', v);
    scope.addViewer('2', v);
    let change = scope.removeViewer('2', v);
    expect(change.removed.length).to.equal(0);
    change = scope.removeViewer('1', v);
    expect(change.removed.length).to.equal(1);
  });

  it('Can move and only change newly covered/uncovered chunks', () => {
    game.viewDistance = 1;
    // View will be a 3x3 grid starting at 0, 0
    const from = new Vector(1, 1);
    const to = new Vector(2, 1);
    scope.addViewer('', from);
    // Move one to the right
    let change = scope.addViewer('', to, from);
    expect(change.added.length).to.be.greaterThan(0);
    expect(change.removed.length).to.equal(0);
    expect(change.added).to.contain('3_0');
    change = scope.removeViewer('', from, to);
    expect(change.removed.length).to.be.greaterThan(0);
    expect(change.added.length).to.equal(0);
    expect(change.removed).to.contain('0_0');
  });

  it('Does not track anything outside the size of the world', () => {
    game.viewDistance = 5;
    scope.addViewer('', new Vector(0, 0));
    expect(scope.active.has(new Vector(-1, -1).getIndexString())).to.be.false;
    scope.addViewer('', new Vector(15, 15));
    expect(scope.active.has(new Vector(16, 16).getIndexString())).to.be.false;
    expect(scope.active.has(new Vector(15, 15).getIndexString())).to.be.true;
  });

});