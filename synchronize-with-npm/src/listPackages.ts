import fs from "fs";
import { join, dirname } from "path";

import { listAllPkgJsons, logIterable } from "@frontside/actions-utils";

export interface ToDeprecate {
  name: string;
  description: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  path: string;
}

interface PackagesList {
  pkgsToPublish: PackageInfo[];
  pkgsToDeprecate: ToDeprecate[];
}

export function listPackages(directory = "."): PackagesList {
  let pkgsToDeprecate: ToDeprecate[] = [];
  let privatePkgs: string[] = [];
  let pkgsToPublish: PackageInfo[] = listAllPkgJsons(directory).reduce((acc, pkgJsonPath) => {
    let path = join(directory, pkgJsonPath);
    let { name, private: privatePackage, deprecate, version } = JSON.parse(
      fs.readFileSync(path, { encoding: "utf-8" })
    );

    if (privatePackage) {
      privatePkgs = [...privatePkgs, name];
      return acc;
    } else if (deprecate) {
      pkgsToDeprecate = [...pkgsToDeprecate, { name, description: deprecate }];
      return acc;
    } else {
      return [...acc, { name, version, path: dirname(path) }];
    }
  }, [] as PackageInfo[]);

  logIterable(
    "Omitting the following packages because they are private:",
    privatePkgs,
  );

  logIterable(
    "Packages to publish if eligible:",
    pkgsToPublish.map(pkg => pkg.name),
    "There are no public packages in this repository",
  );

  logIterable(
    "The following packages will be deprecated:",
    pkgsToDeprecate.map(pkg => pkg.name),
  );

  return {
    pkgsToPublish,
    pkgsToDeprecate,
  };
}
