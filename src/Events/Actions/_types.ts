export enum ActionType {
  INVALID = 'INVALID',
  ADD_PROPERTY_ACTION = 'ADD_PROPERTY_ACTION',
  ADD_SLOT_ACTION = 'ADD_SLOT_ACTION',
  ATTACH_COMPONENT_ACTION = 'ATTACH_COMPONENT_ACTION',
  CHANGE_WORLD_ACTION = 'CHANGE_WORLD_ACTION',
  EQUIP_ITEM_ACTION = 'EQUIP_ITEM_ACTION',
  FORGET_ABILITY_ACTION = 'FORGET_ABILITY_ACTION',
  LEARN_ABILITY_ACTION = 'LEARN_ABILITY_ACTION',
  LOSE_ENTITY_ACTION = 'LOSE_ENTITY_ACTION',
  MODIFY_PROPERTY_ACTION = 'MODIFY_PROPERTY_ACTION',
  MOVE_ACTION = 'MOVE_ACTION',
  PROPERTY_CHANGE_ACTION = 'PROPERTY_CHANGE_ACTION',
  PUBLISH_ENTITY_ACTION = 'PUBLISH_ENTITY_ACTION',
  RELATIVE_MOVE_ACTION = 'RELATIVE_MOVE_ACTION',
  REMOVE_PROPERTY_ACTION = 'REMOVE_PROPERTY_ACTION',
  REMOVE_SLOT_ACTION = 'REMOVE_SLOT_ACTION',
  SENSE_ENTITY_ACTION = 'SENSE_ENTITY_ACTION',
  UNPUBLISH_ENTITY_ACTION = 'UNPUBLISH_ENTITY_ACTION',
  PUBLISH_PLAYER_ACTION = 'PUBLISH_PLAYER_ACTION',
  OWN_ENTITY_ACTION = 'OWN_ENTITY_ACTION',
  MESSAGE = 'MESSAGE'
}

export enum BroadcastType {
  NONE,                   // never broadcast to client (internal logic)
  DIRECT,                 // broadcasts only to a direct client
  OWNER,                  // broadcast only to owning player(s)
  TEAM,                   // broadcast to owning teams
  SENSED_ACTION,          // broadcast to any owner of a component that has sensed the action itself
  HAS_SENSE_OF_ENTITY,    // broadcast to any player/team that currently has sense of the target/entity
  FULL                    // broadcast to all clients
}