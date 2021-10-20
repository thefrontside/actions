import { exec, Process } from "@effection/process";
import { PullRequestPayload } from ".";
import glob from "glob";

export function* findPackages(payload: PullRequestPayload): Generator<any, Iterable<string>, any> {
  let {
    head: {
      sha: headSHA,
    },
    base: {
      sha: baseSHA,
    },
  } = payload.pull_request;

  let gitDiff: Process = yield exec(`git diff ${baseSHA}...${headSHA} --name-only`);

  let buffer: string[] = yield gitDiff.stdout.lines().toArray();

  let directories = [...new Set(buffer.map(output => {
    if (output.includes('/')) {
      return output.replace(/([^\/]*)$/, '');
    } else {
      return '.';
    }
  }))];

  let listAllPkgJsonsWithin = (directory: string) => glob.sync("**/package.json", {
    cwd: directory,
    ignore: ["node_modules/**"]
  });

  let depthOfPath = (directory: string): number => {
    let matched = directory.match(/\//g);
    return matched ? matched.length : 0;
  };

  let superDirectory = (directory: string): string => {
    return depthOfPath(directory) > 1 ? directory.replace(/[^\/]+\/?$/, '') : '.';
  };

  let findRelativePkgJsonPaths = ({ acc, directory }: { acc: string[], directory: string }) => {
    for (let i = directory; i != '.'; i = superDirectory(i)) {
      let pkgJsons = listAllPkgJsonsWithin(i);
      if (pkgJsons.length === 1 && pkgJsons[0] === "package.json") {
        return [...acc, i];
      }
    }

    let pkgJsonsAtRoot = listAllPkgJsonsWithin('.');
    if (pkgJsonsAtRoot.length === 1 && pkgJsonsAtRoot[0] === "package.json") {
      return [...acc, '.'];
    }

    return acc;
  };

  return [... new Set(directories.reduce((acc, directory) => findRelativePkgJsonPaths({ acc, directory }), [] as string[]))];
}
