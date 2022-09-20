import { all, fetch, Operation } from "effection";
import { PackageInfo } from "./listPackages";

export interface PublishCheck {
  publish: PackageInfo[];
  skip: PackageInfo[];
}

export function* checkIfPublished(pkgsToCheck: PackageInfo[]): Operation<PublishCheck> {
  let statuses: { pkg: PackageInfo, published: boolean }[] = yield all(
    pkgsToCheck.map(pkg =>
      function* () {
        let request: Response = yield fetch(`https://registry.npmjs.com/${pkg.name}`);
        if (request.status === 404) {
          return { pkg, published: false };
        } else if (request.status < 400) {
          let response: Record<string, Record<string, string>> = yield request.json();

          return { pkg, published: pkg.version in response["versions"] };
        } else {
          throw new Error("request error");
        }
      }
    )
  );

  return {
    publish: statuses.filter(s => !s.published).map(({ pkg }) => pkg),
    skip: statuses.filter(s => s.published).map(({ pkg }) => pkg),
  };
}
