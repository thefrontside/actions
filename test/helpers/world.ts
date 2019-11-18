import { fork, Operation } from 'effection';
import { beforeEach, afterEach } from 'mocha';

/**
 * Provides a sandbox for arbitrarily complex async operations within a
 * test case that will always be shutdown whenever that test case quit
 * for whatever reason.
 *
 * For example, in our test suite, we're doing a lot of exterval
 * processing, both with git, and also with an NPM server, and
 * shelling out to the action itself. If the test times out, during
 * that time, we need to abort _all_ of that stuff immediately. That's
 * where `World` comes in. If we always `World.fork()` instead of
 * global `fork()`, then whatever the operation is, it will not
 * outlive the lifetime of the tescase.
 *
 * ``` js
 *   beforeEach(() => {
 *     World.fork(function* startNPMServer() {
 *       //....
 *     });
 *     World.fork(function* runAction() {
 *     });
 *   });
 *
 *
 */

export class World  {
  static current: World;

  static fork<T>(operation: Operation): Promise<T> {
    return World.current.execution.fork(operation) as unknown as Promise<T>;
  }

  static create() {
    World.current = new World();
  }

  static destroy() {
    World.current.execution.halt("world destroyed");
  }

  execution: any;

  constructor() {
    this.execution = fork(function*() { yield; });
  }
}

beforeEach(() => {
  World.create();
});

afterEach(() => {
  World.destroy();
});
