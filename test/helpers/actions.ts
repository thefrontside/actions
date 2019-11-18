
import * as Path from 'path';
import { Index, Repository, Signature, Oid, Reference } from 'nodegit';
import { Operation } from 'effection';

import { rimraf, mkdir, writeFile } from './fs';
import { spawn, Output } from './spawn';
import { World } from './world';

type ActionName = 'publish-pr-preview';

interface Patch {
  [key: string]: string | Patch;
}

interface ActionSpec {
  baseRef?: string;
  headRef: string;
  change: Patch;
  event: any;
  env: NodeJS.ProcessEnv
}


export const actions = {
  run(name: ActionName, spec: ActionSpec): Promise<Output> {
    return World.fork(function* runAction() {
      let path = Path.join(process.cwd(), 'test', 'run');
      yield rimraf(path); // wipe the directory
      yield mkdir(path);  // then create the directory

      // create directory structure
      // test/run
      // |
      // + home/
      // | |- .npmrc
      // + workflow/
      // | |- event.json
      // | repo/
      //   |- package.json

      let HOME = Path.join(path, 'home')
      yield mkdir(HOME);
      yield spawn("npm", ['config', 'set', '-g', 'registry', 'http://localhost:4873'], {
        env: {
          PATH: process.env.PATH,
          HOME
        }
      });

      //write workflow/event.json
      yield mkdir(Path.join(path, 'workflow'));
      yield writeFile(Path.join(path, 'workflow', 'event.json'), JSON.stringify(spec.event, null, 2) + "\n");

      let repoPath = Path.join(path, 'repo');
      let { headRef, baseRef = 'master' } = spec;
      let repo: Repository = yield createGitRepository(repoPath);

      yield spawn("npm-auth-to-token", ['-u', 'user', '-p', 'password', '-e', 'user@example.com', '-r', 'http://localhost:4873'], {
        cwd: repoPath,
        env: {
          PATH: process.env.PATH,
          HOME
        }
      });

      let base: Reference = yield ensureRef(repo, baseRef);
      yield applyPatch(repo, base, headRef, spec.change);

      //invoke the action

      let output: Output = yield spawn("sh", [
        Path.join(process.cwd(), `${name}/entrypoint.sh`)
      ], {
        cwd: repoPath,
        env: {
          ...spec.env || {},
          HOME,
          PATH: process.env.PATH,
          GITHUB_BASE_REF: baseRef,
          GITHUB_HEAD_REF: headRef,
          GITHUB_WORKSPACE: repoPath,
          NO_COMMENT: 'true'
        }
      });

      return output;
    })
  }
}

function* ensureRef(repo: Repository, name: string): Operation {
  let oid: Oid = yield Reference.nameToId(repo, "HEAD");
  let ref: Reference = yield Reference.create(repo, `refs/heads/${name}`, oid, 1, "ensure reference");
  return ref;
}

function* applyPatch(repo: Repository, base: Reference, headRef: string, patch: Patch) {
  let head: Reference = yield repo.createBranch(headRef, base.target());
  yield repo.checkoutBranch(head);

  //write the changes
  let files = yield applyChanges(repo, patch);

  // commit changes

  yield repo.createCommitOnHead(files, sign(), sign(), "changes on head");
}

function* applyChanges(repo: Repository, patch: Patch, path: string[] = []) {
  let files: string[] = [];
  for (let key of Object.keys(patch)) {
    let value = patch[key];
    if (typeof value === 'string') {
      let repopath = [Path.dirname(repo.path())];
      let filepath = path.concat(key);
      files.push(filepath.join('/'));
      yield writeFile(repopath.concat(filepath).join('/'), value);
    } else {
      files = files.concat(yield applyChanges(repo, patch, path.concat(key)));
    }
  }
  return files;
}

function createGitRepository(path: string): Operation {
  return function* createRepository() {
    yield mkdir(path);

    // create the git repository
    let repository: Repository = yield Repository.init(path, 0);

    // setup the npm package sources
    yield writeFile(Path.join(path, 'package.json'), JSON.stringify({
      "name": "coolpackage",
      "version": "1.0.0",
      "private": false,
      "description": "Just a test package"
    }, null, 2) + "\n");

    let index: Index = yield repository.refreshIndex();
    yield index.addByPath('package.json');
    index.write();
    let diff: Oid = yield index.writeTree();

    yield repository.createCommit("HEAD", sign(), sign(), "Initial Commit", diff, []);
    return repository;
  }
}


function sign(): Signature {
  return Signature.now("Action Test Suite", "actiontest@testaction.com");
}
