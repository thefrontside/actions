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
      ref: headBranch,
    },
    base: {
      ref: baseBranch,
    },
  } = payload?.pull_request;
  let arrz: string[] = [];
  //@ts-ignore 🚨 how do i type this
  const gitDiff = yield exec(`git diff ${baseBranch}...${headBranch} --name-only`);
  //@ts-ignore 🚨
  yield spawn(gitDiff.stdout.forEach(output => {
    arrz = [...arrz, output];
  }));
  yield gitDiff.join();
  return arrz;
}
