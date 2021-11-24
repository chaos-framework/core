import { expect } from 'chai';
import 'mocha';
import { v4 as uuid } from 'uuid';

import { Team, Chaos } from '../../../src/internal.js';


describe('Team', () => {
  let team: Team;
  beforeEach(() => {
    Chaos.reset();
    team = new Team({ name: 'Red' });
  });

  describe('Serializing and Deserializing', () => {

    it('Serializes for the client properly', () => {
      const serialized = team.serializeForClient();
      expect(serialized.id).to.equal(team.id);
      expect(serialized.name).to.equal(team.name);
    });
    
    it('Deserializes for the client properly', () => {
      const serialized = team.serializeForClient();
      const deserialized = Team.DeserializeAsClient(serialized);
      expect(deserialized.id).to.equal(team.id);
      expect(deserialized.name).to.equal(team.name);
    });
  });

  // Construction, and uuid -> name if none provided
  // Owning and disowning entities, along with scope modifications, handled in integration tests
});
