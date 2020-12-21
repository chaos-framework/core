import Team from './Team';

export default class Player {
  id: number;
  entities = new Set<number>();
  teams = new Set<string>();

  constructor(public name: string) {
    this.id = 1;
  }
}
