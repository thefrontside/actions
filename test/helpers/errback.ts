import { Execution, Operation } from 'effection';

type Errback = (error: Error, ...rest: any[]) => void;

export function errback(invoke: (cb: Errback) => void): Operation {
  return (execution: Execution) => {
    let iCare = true;
    invoke((error: Error, ...rest: any[]) => {
      if (iCare) {
        if (error) {
          execution.throw(error);
        } else {
          execution.resume(rest);
        }
      }
    })
    return () => { iCare = false; }
  }
}
