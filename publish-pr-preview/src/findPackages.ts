// find packages
//   - git diff and list all directories with changes
//   - find all package jsons from the git diff
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

interface FindPackagesRun extends Omit<PreviewRun, 'octokit'> {};

export function* findPackages({ core, payload }: FindPackagesRun) {
  const {
    head: {
      sha: headSHA,
    },
    base: {
      sha: baseSHA,
    },
  } = payload.pull_request;

  let arrz: string[] = [];

  try {
    //@ts-ignore
    // const confirmCommitFetch = yield exec(`git show ${baseSHA}`);
    const confirmCommitFetch = yield exec(`git show 12345`);
    yield confirmCommitFetch.expect();
  } catch {
      console.log('in catch');
    throw new Error("The base commit could not be found. Configure the checkout action in your workflow with the correct settings. Refer to this action's README for more details.");
  }

  //@ts-ignore 🚨 how do i type this
  const gitDiff = yield exec(`git diff ${baseSHA}...${headSHA} --name-only`);
  //@ts-ignore 🚨
  yield spawn(gitDiff.stdout.forEach(output => {
    arrz = [...arrz, Buffer.from(output).toString()];
  }));
  yield gitDiff.join();
  return arrz;
}
