import { exec } from "@effection/process";
import { all, Operation } from "effection";
import { ToPublish } from "./listPackages";
import { colors, logIterable } from "@frontside/actions-utils";

export function* checkIfPublished({ pkgsToPublish }:{ pkgsToPublish: ToPublish[] }): Operation<ToPublish[]> {
  let confirmedPkgsToPublish: ToPublish[] = [];
  let alreadyPublished: ToPublish[] = [];
  yield all(
    pkgsToPublish.map(pkg =>
      function* () {
        let { stdout } = yield exec(`npm view ${pkg.name}@${pkg.version}`).expect();
        if (!stdout) {
          confirmedPkgsToPublish = [...confirmedPkgsToPublish, pkg];
        } else {
          alreadyPublished = [...alreadyPublished, pkg];
        }
      }
    )
  );

  logIterable(
    "Skipping the following packages because they are already published:",
    alreadyPublished.map(pkg => `${colors.blue(pkg.name)+colors.yellow("@")+colors.blue(pkg.version)}`),
  );

  return confirmedPkgsToPublish;
}
