import { all, fetch, Operation } from "effection";
import { ToPublish } from "./listPackages";
import { colors, logIterable } from "@frontside/actions-utils";

export function* checkIfPublished({ pkgsToPublish }:{ pkgsToPublish: ToPublish[] }): Operation<ToPublish[]> {
  let confirmedPkgsToPublish: ToPublish[] = [];
  let alreadyPublished: ToPublish[] = [];
  yield all(
    pkgsToPublish.map(pkg =>
      function* () {
        let request: Response = yield fetch(`https://registry.npmjs.com/${pkg.name}`);
        if (request.status === 404) {
          return 'not published';
        } else if (request.status < 400) {
          let response: Record<string, Record<string, string>> = yield request.json();
          return response['dist-tags'][pkg.version];
        } else {
          throw new Error('request error');
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
