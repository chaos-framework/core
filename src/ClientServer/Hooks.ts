import { Action } from "../internal.js";

export type ActionHook = (action: Action) => void;
export type ExecutionHook = (actions: Action[]) => void;