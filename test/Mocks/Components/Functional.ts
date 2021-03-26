import { Component, Action, Modifier, Reacter } from '../../../src/internal';

export class EmptyComponent extends Component {
  name = "Empty Component";
  unique = false;
}

export class ModifiesAndReactsAtWorldScope extends Component implements Modifier, Reacter {
  static breadcrumb = "modifiedatworldscope";

  constructor() {
    super();
  }

  modify(a: Action) {
    a.breadcrumbs.add(ModifiesAndReactsAtWorldScope.breadcrumb);
  }

  react(a: Action) {
  }
}
