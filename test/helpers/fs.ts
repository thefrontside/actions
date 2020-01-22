import * as Fs from 'fs';
import * as _rimraf from 'rimraf';
import { Operation } from 'effection';

import { errback } from './errback';

export function rimraf(path: string, options: _rimraf.Options = {}): Operation {
  return errback(cb => _rimraf(path, options, cb));
}

export function mkdir(path: string) {
  return errback(cb => Fs.mkdir(path, cb));
}

export function writeFile(path: string, content: string): Operation {
  return function* writeContent() {
    let stream = Fs.createWriteStream(path);
    try {
      yield errback(cb => stream.write(content, cb));
    } finally {
      stream.close();
    }
  }
}

export function readFile(path: string): Operation {
  return function* readContents() {
    let [ content ]: [ string ] = yield errback(cb => Fs.readFile(path, { encoding: 'utf8' }, cb));
    return content;
  }
}
