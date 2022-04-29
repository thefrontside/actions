import { all, Operation } from "effection";
import { exec, ProcessResult } from "@effection/process";
import { PackageTags } from ".";
import { colors, logIterable } from "@frontside/actions-utils";

export function* removeTags({
  allPackageTags,
  gitBranches,
  preserve,
}:{
  allPackageTags: PackageTags[]
  gitBranches: string[]
  preserve: string[]
}): Operation<void> {
  let v1 = gitBranches.map(branch => branch.replace(/_/g, "__").replace(/\//g, "_"));
  let v2 = gitBranches.map(branch => branch.replace(/(_|\/)/g, "-"));
  let branchTags = [...v1, ...v2, ...preserve].map(tag => tag.toLowerCase());

  let deletedTags: string[] = [];
  let keptTags: string[] = [];
  let forbidden: string[] = [];

  console.log(colors.yellow("Removing stale NPM tags..."));
  yield all(
    allPackageTags.map(pkg =>
      function* () {
        yield all(
          pkg.tags.map(tag =>
            function* () {
              if (branchTags.includes(tag)) {
                keptTags = [...keptTags, tag];
              } else {
                let result: ProcessResult = yield exec(`npm dist-tag rm ${pkg.name} ${tag}`).join();
                if (result.code === 0) {
                  deletedTags = [...deletedTags, tag];
                } else if (result.code === 1 && result.stderr.includes("403 Forbidden")) {
                  forbidden = [...forbidden, pkg.name];
                }
              }
            }
          )
        );
      }
    )
  );

  logIterable(
    "The following packages returned a 403 error which means the NPM token you provided in the workflow does not have sufficient permissions:",
    [...new Set(forbidden)],
  );

  logIterable(
    "The following tags were removed from NPM:",
    [...new Set(deletedTags)],
    "This workflow run did not remove any tags from NPM"
  );

  logIterable(
    "The following tags were preserved:",
    [...new Set(keptTags)]
  );
}
