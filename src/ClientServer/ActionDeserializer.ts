
import { Action, ActionType,
  PublishPlayerAction, PublishEntityAction, MoveAction, RelativeMoveAction } from "../internal";

export default class ActionDeserializer {
  static deserializeAction(json: any): Action {
    if(json.actionType !== undefined) {
      switch(json.actionType) {
        case ActionType.PUBLISH_ENTITY_ACTION:
          return PublishEntityAction.deserialize(json);
        case ActionType.PUBLISH_PLAYER_ACTION:
          return PublishPlayerAction.deserialize(json);
        case ActionType.MOVE_ACTION:
          return MoveAction.deserialize(json);
        case ActionType.RELATIVE_MOVE_ACTION:
          return RelativeMoveAction.deserialize(json);
      }
    }
    throw new Error("Invalid action passed from server.");
  }
}
