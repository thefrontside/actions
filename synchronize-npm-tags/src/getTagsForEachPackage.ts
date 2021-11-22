import { all, Operation } from "effection";
import { exec, Process } from "@effection/process";
import { PackageTags } from ".";
import { colors } from "@frontside/actions-utils";

export function* getTagsForEachPackage({ publicPackages }: { publicPackages: string[] }): Operation<PackageTags[]> {
  let allPackageTags: PackageTags[] = [];

  console.log(colors.yellow("Retrieving NPM tags for each package...\n"));
  yield all(
    publicPackages.map(pkg =>
      function* () {
        let npmDistTagLS: Process = yield exec(`npm dist-tag ls ${pkg}`);
        let results: string[] = yield npmDistTagLS.stdout.lines().toArray();
        yield npmDistTagLS.expect();
        let tagsWithoutVersions = results.map(tag => tag.split(":")[0]);
        if (tagsWithoutVersions.length) {
          allPackageTags = [...allPackageTags, {
            name: pkg,
            tags: tagsWithoutVersions,
          }];
        }
      }
    )
  );

  return allPackageTags;
}
