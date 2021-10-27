import { Action } from "../internal";

export type ActionHook = (action: Action) => void;
export type ExecutionHook = (actions: Action[]) => void;