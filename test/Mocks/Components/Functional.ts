import Component from '../../../src/EntityComponent/Component';
import Action from '../../../src/Events/Action';
import { Modifier, Reacter } from '../../../src/Events/Interfaces';

export class EmptyComponent extends Component {
  name = "Empty Component";
  unique = false;
}

export class ModifiesAndReactsAtWorldScope extends Component implements Modifier, Reacter {
  static breadcrumb = "modifiedatworldscope";

  constructor() {
    super();
    this.scope = "World";
  }

  modify(a: Action) {
    a.breadcrumbs.add(ModifiesAndReactsAtWorldScope.breadcrumb);
  }

  react(a: Action) {
  }
}
