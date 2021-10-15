import { exec, Process } from "@effection/process";
import { PullRequestPayload } from ".";

export function* findPackages(payload: PullRequestPayload): Generator<any, Iterable<string>, any> {
  const {
    head: {
      sha: headSHA,
    },
    base: {
      sha: baseSHA,
    },
  } = payload.pull_request;

  try {
    const confirmCommitFetch: Process = yield exec(`git show ${baseSHA}`);
    yield confirmCommitFetch.expect();
  } catch {
    throw new Error("The base commit could not be found. Configure the checkout action in your workflow with the correct settings. Refer to this action's README for more details.");
  }

  const gitDiff: Process = yield exec(`git diff ${baseSHA}...${headSHA} --name-only`);
  let packagesToPublish: Iterable<string> = yield gitDiff.stdout.map(output => output.toString().replace(/\\n$/, '')).toBuffer();
  yield gitDiff.expect();

  return packagesToPublish;
}

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
