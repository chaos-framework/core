import { Player } from "../internal";

export interface Command {
  player: string,  // id of player (client) who sent this command
  time: Date,       // time that it was recieved
  name: string,     // name of command
  params?: { [key: string]: string } // misc params, ie target, distance, type, thing to say, etc
}

export interface AbilityCommand extends Command {
  entity: string,   // entity using the command on/with
  using?: string,   // id of entity being used
}

export function isCommand(o: any): o is Command {
  return typeof o.player === 'string' && typeof o.name === 'string';
}

export function isAbilityCommand(o: any): o is AbilityCommand {
  return typeof o.player === 'string' && typeof o.name === 'string' && typeof o.entity === 'string';
}