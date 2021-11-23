import { all, Operation } from "effection";
import { exec } from "@effection/process";
import { ToDeprecate } from "./listPackages";

export function* deprecatePackages({ pkgsToDeprecate }: { pkgsToDeprecate: ToDeprecate[] }): Operation<string[]> {
  if (pkgsToDeprecate.length) {
    let deprecatedPackages: string[] = [];
    yield all(
      pkgsToDeprecate.map(pkg =>
        function* () {
          yield exec(`npm deprecate ${pkg.name} ${pkg.description}`).join();
          deprecatedPackages = [...deprecatedPackages, pkg.name];
        }
      )
    );
    return deprecatePackages;
  } else {
    return [];
  }
}
