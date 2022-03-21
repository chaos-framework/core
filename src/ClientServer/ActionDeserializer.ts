import { 
  Action, ActionType, PublishPlayerAction,
  PublishEntityAction, MoveAction,
  OwnEntityAction, UnpublishEntityAction, ChangeTurnAction, DetachComponentAction, AttachComponentAction
} from "../internal.js";

export class ActionDeserializer {
  static deserializeAction(json: any): Action {
    try {
      if(json.actionType !== undefined) {
        switch(json.actionType) {
          case ActionType.ADD_PROPERTY_ACTION:
            break;
          case ActionType.ADD_SLOT_ACTION:
            break;
          case ActionType.ATTACH_COMPONENT_ACTION:
            return AttachComponentAction.deserialize(json);
            break
          case ActionType.CHANGE_TURN_ACTION:
            return ChangeTurnAction.deserialize(json);
          case ActionType.CHANGE_WORLD_ACTION:
            // return ChangeWorldAction.deserialize(json);
            break;
          case ActionType.DETACH_COMPONENT_ACTION:
            return DetachComponentAction.deserialize(json);
          case ActionType.PUBLISH_ENTITY_ACTION:
            return PublishEntityAction.deserialize(json);
          case ActionType.PUBLISH_PLAYER_ACTION:
            return PublishPlayerAction.deserialize(json);
          case ActionType.MOVE_ACTION:
            return MoveAction.deserialize(json);
          case ActionType.OWN_ENTITY_ACTION:
            return OwnEntityAction.deserialize(json);
          case ActionType.UNPUBLISH_ENTITY_ACTION:
            return UnpublishEntityAction.deserialize(json);
        }
      }
      throw new Error("Invalid action passed from server.");
    } catch (err) {
      console.error('Could not deserialize an action:');
      console.error((err as any).message);
      throw err;
    }
  }
}
