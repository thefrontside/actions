import { listAllPkgJsons, logIterable } from "@frontside/actions-utils";

export function findPackages(gitDiff: string[]): string[] {
  let directories = [...new Set(gitDiff.map(output => {
    if (output.includes("/")) {
      return output.replace(/([^\/]*)$/, "");
    } else {
      return ".";
    }
  }))];

  logIterable(
    "Directories from git diff:",
    directories,
  );

  let depthOfPath = (directory: string): number => {
    let matched = directory.match(/\//g);
    return matched ? matched.length : 0;
  };

  let superDirectory = (directory: string): string => {
    return depthOfPath(directory) > 1 ? directory.replace(/[^\/]+\/?$/, "") : ".";
  };

  let findRelativePkgJsonPaths = ({ acc, directory }: { acc: string[], directory: string }) => {
    for (let i = directory; i != "."; i = superDirectory(i)) {
      let pkgJsons = listAllPkgJsons(i);
      if (pkgJsons.length === 1 && pkgJsons[0] === "package.json") {
        return [...acc, i];
      }
    }

    let pkgJsonsAtRoot = listAllPkgJsons();
    if (pkgJsonsAtRoot.length === 1 && pkgJsonsAtRoot[0] === "package.json") {
      return [...acc, "."];
    }

    return acc;
  };

  let directoriesToPublish = [...new Set(directories.reduce((acc, directory) => findRelativePkgJsonPaths({ acc, directory }), [] as string[]))];

  logIterable(
    "Directories with package.json located:",
    directoriesToPublish,
  );

  return directoriesToPublish;
}
