import { Component } from '../../../src/internal.js';

export class NonBroadcastingComponent extends Component {
  name = "Non-Public Logical Component";
  public = false; // important bit
  broadcast = false; // important bit
  tags = new Set<string>(['hidden']);
  unique = true;
}