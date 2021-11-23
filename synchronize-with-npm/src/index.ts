import { GitHub } from "@actions/github/lib/utils";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
import { listPackages } from "./listPackages";

export interface ActionPayload {
  octokit: InstanceType<typeof GitHub>;
  core: typeof Core;
}

export function* run({ octokit, core }: ActionPayload): Operation<void> {
  console.log("doodoo", octokit);
  // find all packages, omit private packages, omit package.json from path
  let { pkgsToPublish, pkgsToDeprecate } = listPackages();
  console.log(pkgsToPublish, pkgsToDeprecate, core);
  // let installScript = core.getInput("INSTALL_SCRIPT") || "";
  // npm view to see if version already exists
  // yarn install, yarn prepack (from root) = INSTALL_SCRIPT
  // npm publish
  // deprecate
    // npm deprecate pkg description
}
