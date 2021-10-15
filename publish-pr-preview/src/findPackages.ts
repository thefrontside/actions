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

  let buffer: string[] = yield gitDiff.stdout.lines().toArray();

  let directories = new Set(buffer.map(output => {
    if (output.includes('/')) {
      return output.replace(/([^\/]*)$/, '');
    } else {
      return '.';
    }
  }));

  // remove duplicates
  // locate package.json
    // if not go up one level and try again until root
  // remove private packages

  let packagesToPublish = directories; // wip

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


/*
[
  '.github/workflows/',
  '.',
  'publish-pr-preview/',
  'publish-pr-preview/',
  'publish-pr-preview/dist/',
  'publish-pr-preview/dist/',
  'publish-pr-preview/dist/src/',
  'publish-pr-preview/dist/src/',
  'publish-pr-preview/dist/src/',
  'publish-pr-preview/dist/src/',
  'publish-pr-preview/',
  'publish-pr-preview/old/',
  'publish-pr-preview/old/',
  'publish-pr-preview/old/',
  'publish-pr-preview/',
  'publish-pr-preview/src/',
  'publish-pr-preview/src/',
  'publish-pr-preview/src/',
  'publish-pr-preview/',
  '.'
]
*/