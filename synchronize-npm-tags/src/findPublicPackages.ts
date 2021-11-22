import fs from "fs";
import { listAllPkgJsons } from "@frontside/actions-utils";
import { logIterable } from "./logIterable";

export function findPublicPackages(): string[] {
  let privatePackages: string[] = [];
  let eligiblePackages: string[] = listAllPkgJsons().reduce((acc, pkgJsonPath) => {
    let { name, private: privatePackage } = JSON.parse(
      fs.readFileSync(pkgJsonPath, { encoding: "utf-8" })
    );
    if (privatePackage) {
      privatePackages = [...privatePackages, name];
      return acc;
    } else {
      return [...acc, name];
    }
  }, [] as string[]);

  logIterable(
    "Omitting the following packages because they are private:",
    privatePackages,
  );

  logIterable(
    "Running action for the following packages:",
    eligiblePackages,
    "There are no public packages in this repository"
  );

  return eligiblePackages;
}
