import { fork, Operation } from 'effection';
import * as cp from 'child_process';

import { on } from './events';

export interface Output {
  stdout: string;
  stderr: string;
}

export type SpawnOptions = cp.SpawnOptions;


export function* spawn(command: string, args: string[], options: cp.SpawnOptions = {}): Operation {
  let action = cp.spawn(command, args, {...options, stdio: process.env.debug ? 'inherit' : 'pipe' });

  let output = { stdout: '', stderr: ''};

  let monitors = fork(function*() {
    if (!process.env.debug) {
      fork(function* out() {
        while (true) {
          let [ data ]: [string] = yield on(action.stdout, 'data');
          output.stdout += data;
        }
      });
      fork(function* err() {
        while (true) {
          let [data]: [string] = yield on(action.stderr, 'data');
          output.stderr += data;
        }
      });
    }
    fork(function* errorMonitor() {
      let [error]: [Error] = yield on(action, "error");
      console.log('error = ', error);
      throw error;
    })
  })


  try {
    let [code] = yield on(action, "exit");
    monitors.halt();
    if (code > 0) {
      throw new Error(`Action Failed with code ${code}
stderr:
${output.stderr}
stdout:
${output.stdout}`);

    }

    return output;
  } finally {
    action.kill('SIGKILL');
  }
}
