import fs from "fs";
import { listAllPkgJsons, logIterable } from "@frontside/actions-utils";

interface ToDeprecate {
  name: string;
  description: string;
}

export interface ToPublish {
  name: string;
  version: string;
}

interface PackagesList {
  pkgsToPublish: ToPublish[];
  pkgsToDeprecate: ToDeprecate[];
}

export function listPackages(): PackagesList {
  let pkgsToDeprecate: ToDeprecate[] = [];
  let privatePkgs: string[] = [];
  let pkgsToPublish: ToPublish[] = listAllPkgJsons().reduce((acc, pkgJsonPath) => {
    let { name, private: privatePackage, deprecate, version } = JSON.parse(
      fs.readFileSync(pkgJsonPath, { encoding: "utf-8" })
    );
    if (privatePackage) {
      privatePkgs = [...privatePkgs, name];
      return acc;
    } else if (deprecate) {
      pkgsToDeprecate = [...pkgsToDeprecate, { name, description: deprecate }];
      return acc;
    } else {
      return [...acc, { name, version }];
    }
  }, [] as ToPublish[]);

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
