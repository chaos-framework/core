import { expect } from 'chai';
import 'mocha';

import Game from '../../src/Game/Game';
import EmptyGame from '../Mocks/Games/EmptyGame';

describe('Game', () => {
  let game: Game;
  beforeEach(() => { game = new EmptyGame({}) })

  it('Should be a singleton', () => {
    expect(game).to.be.not.null;
    expect(Game.getInstance()).to.be.not.null;
    expect(Game.getInstance()).to.equal(game);
  });
});