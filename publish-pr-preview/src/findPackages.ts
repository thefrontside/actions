// find packages
//   - git diff and list all directories with changes
//   - find all package jsons
//       for each directory with changes
//         pkg.json
//           ? 
//             skip
//               ? do nothing
//               : add to array of confirmed packages to publish
//           : go up one level and try again``

import { spawn, } from "effection";
import { exec } from "@effection/process";
import { PreviewRun } from ".";

interface FindPackagesRun extends Omit<PreviewRun, 'octokit'|'core'> {};

export function* findPackages({ payload }: FindPackagesRun) {
  const {
    head: {
      sha: headSHA,
    },
    base: {
      sha: baseSHA,
    },
  } = payload.pull_request;

  let arrz: string[] = [];
  //@ts-ignore 🚨 how do i type this
  const gitDiff = yield exec(`git diff ${baseSHA}...${headSHA} --name-only`);
  //@ts-ignore 🚨
  yield spawn(gitDiff.stdout.forEach(output => {
    arrz = [...arrz, Buffer.from(output).toString()];
  }));
  yield gitDiff.join();

  let stdout: string[] = [];
  let stderr: string[] = [];
  //@ts-ignore
  const testGitShow = yield exec(`git show whatwhat123`);
  //@ts-ignore
  yield spawn(testGitShow.stdout.forEach(output => {
    stdout = [...stdout, Buffer.from(output).toString()];
  }));
  //@ts-ignore
  yield spawn(testGitShow.stderr.forEach(output => {
    stderr = [...stderr, Buffer.from(output).toString()];
  }));
  yield testGitShow.join();
  console.log('yes', 'stdout', stdout, 'stderr', stderr);

  //@ts-ignore
  const testGitShow2 = yield exec(`git show 00d21aa3365d05429cb8dd769762a88a3d3c76b7`);
  //@ts-ignore
  yield spawn(testGitShow2.stdout.forEach(output => {
    stdout = [...stdout, Buffer.from(output).toString()];
  }));
  //@ts-ignore
  yield spawn(testGitShow2.stderr.forEach(output => {
    stderr = [...stderr, Buffer.from(output).toString()];
  }));
  yield testGitShow2.join();
  console.log('yes', 'stdout', stdout, 'stderr', stderr);

  return arrz;
}
