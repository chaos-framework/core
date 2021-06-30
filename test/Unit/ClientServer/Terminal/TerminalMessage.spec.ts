import { expect } from 'chai';
import 'mocha';

import { Entity, TerminalMessage } from "../../../../src/internal";

describe('Terminal Message', () => {
  describe('Printing', () => {
    it('Prints strings and printable items seamlessly', () => {
      const message = new TerminalMessage('1', new Entity({name: '2'}), '3');
      expect(message.print()).to.equal('1 2 3');
    });

    it('Joins all items with spaces in between', () => {
      const message = new TerminalMessage('1', '2', '3');
      expect(message.print()).to.equal('1 2 3');
    });
  });
});