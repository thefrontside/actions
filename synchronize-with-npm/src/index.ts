import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
import { listPackages } from "./listPackages";
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
  let publishedPackages: string[] = yield publishAndTag({ confirmedPkgsToPublish, installScript, octokit, payload });
  let deprecatedPackages: string[] = yield deprecatePackages({ pkgsToDeprecate });
  console.log(publishedPackages, deprecatedPackages);
  // yield printResults({ publishedPackages, deprecatedPackages });
}
