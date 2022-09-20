import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
import { logIterable, colors } from "@frontside/actions-utils";
import { listPackages, PackageInfo } from "./listPackages";
import { checkIfPublished, PublishCheck } from "./checkIfPublished";
import { publishAndTag } from "./publishAndTag";
import { deprecatePackages } from "./deprecatePackages";

export interface GithubActionsPayload extends WebhookPayload {
  repository: WebhookPayload["repository"] & {
    owner: {
      login: string;
    };
    name: string;
  }
}

export interface ActionPayload {
  octokit: InstanceType<typeof GitHub>;
  core: typeof Core;
  payload: GithubActionsPayload
}

export function* run({ octokit, core, payload }: ActionPayload): Operation<void> {
  let dryRun = core.getBooleanInput("DRY_RUN");

  let { pkgsToPublish, pkgsToDeprecate } = listPackages();

  let { publish, skip }: PublishCheck = yield checkIfPublished(pkgsToPublish);

  logIterable(
    "Skipping the following packages because they are already published:",
    skip.map(pkg => `${colors.blue(pkg.name)+colors.yellow("@")+colors.blue(pkg.version)}`),
  );

  let installScript = core.getInput("INSTALL_SCRIPT") || "";
  let publishedPackages: PackageInfo[] = yield publishAndTag({ confirmedPkgsToPublish: publish, installScript, octokit, payload, dryRun });
  let deprecatedPackages: string[] = yield deprecatePackages({ pkgsToDeprecate });

  logIterable(
    "The following packages were successfully published:",
    publishedPackages.map(pkg => `${colors.blue(pkg.name) + colors.yellow("@") + colors.blue(pkg.version)}`),
    "This workflow run did not publish any packages"
  );

  logIterable(
    "The following packages were deprecated:",
    deprecatedPackages,
  );
}
