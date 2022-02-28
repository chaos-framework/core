// import { ActionHandler, Scope } from '../../internal.js';

// type ScopeCollection = Partial<Record<Scope, { [phase: string]: ActionHandler[] }>>;

// function* ddd (a: Action) {

//   return false;
// }

// const a: ScopeCollection = {
//   'entity': {
//     'post': [ddd]
//   }
// }

// export class ActionHandlerCollection {
//   functions: ScopeCollection = {};

//   add(scope: Scope, phase: string, handler: ActionHandler) {
//     let s = (this.functions[scope] ??= {});
//     let p = (s[phase] ??= []);
//     p.push(handler);
//   }
// }
