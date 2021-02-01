import { Action, IEntity, Game, Player, Team, VisibilityType } from '../../../src/internal';

// Game that only lets uninvolved entities see actions tagged 'visible' 
export default class EntityVisibilityGame extends Game {
  name = "IEntity Visibility Game";

  initialize() {
  }

  onPlayerConnect() {
  }

  onPlayerDisconnect() {
  }

  getVisibilityToTeam(a: Action, t: Team): VisibilityType {
    return VisibilityType.DEFER;
  }

  getVisibilityToPlayer(a: Action, p: Player): VisibilityType {
    return VisibilityType.DEFER;
  }

  getVisibilityToEntity(a: Action, e: IEntity): VisibilityType {
    if(a.caster === e || a.target === e) {
      return VisibilityType.VISIBLE;
    }
    return a.tagged('visible') ? VisibilityType.VISIBLE : VisibilityType.NOT_VISIBLE;
  }
  
}