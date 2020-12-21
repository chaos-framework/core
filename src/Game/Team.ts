import Player from './Player';

export default class Team {
  players = new Set<number>();

  constructor(public name: string) {}
}
