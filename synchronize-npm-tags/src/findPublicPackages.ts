import fs from "fs";
import { listAllPkgJsons, colors } from "@frontside/actions-utils";

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

  if (privatePackages.length) {
    console.log(
      colors.yellow("Skipping the following packages because they are"),
      colors.red("PRIVATE") + colors.yellow(":")
    );
    privatePackages.forEach(pkg => console.log("  "+colors.blue(pkg)));
    console.log("");
  }

  if (eligiblePackages.length) {
    console.log(colors.yellow("Running action for the following packages:"));
    eligiblePackages.forEach(pkg => console.log("  "+colors.blue(pkg)));
    console.log("");
  }

  return eligiblePackages;
}
