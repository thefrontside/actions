import { exec, Process } from "@effection/process";
import { PullRequestPayload } from ".";
import glob from "glob";

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

  const buffer: string[] = yield gitDiff.stdout.lines().toArray();

  const directories = [...new Set(buffer.map(output => {
    if (output.includes('/')) {
      return output.replace(/([^\/]*)$/, '');
    } else {
      return '.';
    }
  }))];

  const listAllPkgJsonsWithin = (directory: string) => glob.sync("**/package.json", {
    cwd: directory,
    ignore: ["node_modules/**"]
  });

  const depthOfPath = (directory: string): number => {
    let matched = directory.match(/\//g);
    return matched ? matched.length : 0;
  }

  const superDirectory = (directory: string): string => {
    return depthOfPath(directory) > 1 ? directory.replace(/[^\/]+\/?$/, '') : '.';
  }

  const findRelativePkgJsonPaths = ({ acc, directory }: { acc: string[], directory: string }) => {
    for (let i = directory; i != '.'; i = superDirectory(i)) {
      const pkgJsons = listAllPkgJsonsWithin(i);
      if (pkgJsons.length === 1 && pkgJsons[0] === "package.json") {
        return [...acc, i];
      }
    }

    const pkgJsonsAtRoot = listAllPkgJsonsWithin('.');
    if (pkgJsonsAtRoot.length === 1 && pkgJsonsAtRoot[0] === "package.json") {
      return [...acc, '.'];
    }

    return acc;
  }

  return [... new Set(directories.reduce((acc, directory) => findRelativePkgJsonPaths({ acc, directory }), [] as string[]))];
};
