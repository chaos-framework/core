import { expect } from 'chai';
import 'mocha';
import { Action } from '../../src/internal';
import { actionFunction } from '../../src/EntityComponent/Component';

export function InstanceMethodDecorator() {
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    console.log(target instanceof DecoratorTest);
    console.log(target.initializedInline);
    console.log(target.initializedInConstructor);
    console.log(target, propertyKey, descriptor);
  };
}

class DecoratorTest {
  initializedInline = 1;
  initializedInConstructor: number;
  maybeNotInitialized?: number;

  constructor() {
    this.initializedInConstructor = 2;
  }

  modify(action: Action) {
    
  }

}

describe.only('',() => {
});

const test = new DecoratorTest();
console.log(test.modify.arguments);