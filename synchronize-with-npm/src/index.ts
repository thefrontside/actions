import { GitHub } from "@actions/github/lib/utils";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
import { listPackages } from "./listPackages";
import { checkIfPublished } from "./checkIfPublished";

export interface ActionPayload {
  octokit: InstanceType<typeof GitHub>;
  core: typeof Core;
}

export function* run({ octokit, core }: ActionPayload): Operation<void> {
  console.log("doodoo", octokit);
  let { pkgsToPublish, pkgsToDeprecate } = listPackages();
  console.log(pkgsToPublish, pkgsToDeprecate);
  let confirmedPkgsToPublish = yield checkIfPublished({ pkgsToPublish });
  let installScript = core.getInput("INSTALL_SCRIPT") || "";

  console.log(confirmedPkgsToPublish, installScript);

  // yarn install, yarn prepack (from root) = INSTALL_SCRIPT
  // npm publish
    // git tag name-v{version}
    // git push origin $tag
  // deprecate
    // npm deprecate pkg description
}
