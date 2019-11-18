import { fork, timeout, Execution } from 'effection';
import { before } from 'mocha';
export { actions } from './actions';
import { spawn } from './spawn';
import { rimraf } from './fs';

let verdaccio: Execution;

// start the verdaccio server before running any tests
// this will simulate NPM.
before(async () => {
  verdaccio = fork(spawn("verdaccio", ['--config', 'test/registry/config.yml'], {
    env: {
      PATH: process.env.PATH
    }
  }));

  // wait until we can connect to the server before continuing
  await fork(function*() {
    for (let tries = 1; tries <= 100; tries++) {
      try {
        return yield spawn("curl", ["localhost:4873/ping"]);
      } catch (error) {
        yield timeout(10);
      }
    }
    throw new Error('failed to start verdaccio server');
  });
});

// shutdown verdaccio after all tests have run
after(() => {
  verdaccio.halt();
});


// clear out the verdaccio server storage
// before every test case
beforeEach(async () => {
  await fork(function*() {
    yield rimraf("./test/registry/storage");
  });
});
