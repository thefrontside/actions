import { all, Operation } from "effection";
import { exec, Process } from "@effection/process";
import { PackageTags } from ".";

export function* getTagsForEachPackage({ publicPackages }: { publicPackages: string[] }): Operation<PackageTags[]> {
  console.log(publicPackages);
  // remove later 👇
  let testOtherPackages = ["bigtest", "effection"];
  let allPackageTags: PackageTags[] = [];
  yield all(
    testOtherPackages.map(pkg =>
      function* () {
        let npmDistTagLS: Process = yield exec(`npm dist-tag ls ${pkg}`);
        let results: string[] = yield npmDistTagLS.stdout.lines().toArray();
        yield npmDistTagLS.expect();
        let tagsWithoutVersions = results.map(tag => tag.split(":")[0]);
        allPackageTags = [...allPackageTags, {
          name: pkg,
          tags: tagsWithoutVersions,
        }];
      }
    )
  );
  return allPackageTags;
}
