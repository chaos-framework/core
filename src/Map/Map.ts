import Component, { ComponentContainer } from '../EntityComponent/Component';

export default class Map implements ComponentContainer {
  components: Component[] = [];
}