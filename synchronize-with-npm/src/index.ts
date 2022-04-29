import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
import { logIterable, colors } from "@frontside/actions-utils";
import { listPackages, ToPublish } from "./listPackages";
import { checkIfPublished } from "./checkIfPublished";
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
  let { pkgsToPublish, pkgsToDeprecate } = listPackages();
  let confirmedPkgsToPublish = yield checkIfPublished({ pkgsToPublish });
  let installScript = core.getInput("INSTALL_SCRIPT") || "";
  let publishedPackages: ToPublish[] = yield publishAndTag({ confirmedPkgsToPublish, installScript, octokit, payload });
  let deprecatedPackages: string[] = yield deprecatePackages({ pkgsToDeprecate });

  logIterable(
    "The following packages were successfully published:",
    publishedPackages.map(pkg => `${colors.blue(pkg.name)+colors.yellow("@")+colors.blue(pkg.version)}`),
    "This workflow run did not publish any packages"
  );

  logIterable(
    "The following packages were deprecated:",
    deprecatedPackages,
  );
}
