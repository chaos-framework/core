import { Component, Entity } from "../internal.js";

export class Permission {
    permitted: boolean;
    by?: Entity | Component;
    using?: Entity | Component;
    message?: string;
  
    constructor(permitted: boolean,
      { by, using, message }:
        { by?: Entity | Component, using?: Entity | Component, message?: string } = {}) {
      this.permitted = permitted;
      this.by = by;
      this.using = using;
      this.message = message;
    }
  }
  
  export enum PermissionPriority {
    Base = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Dead = 3,
    Extreme = 4,
    Max = Number.MAX_VALUE
  }
  