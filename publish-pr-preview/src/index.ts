import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
import { checkPrerequisites } from "./checkPrerequisites";
import { findPackages } from "./findPackages";
import { publish } from "./publish";

interface PullRequestBranch {
  ref: string;
  repo: {
    url: string;
  };
  sha: string;
}

export interface PullRequestPayload extends WebhookPayload {
  pull_request: WebhookPayload["pull_request"] & {
    head: PullRequestBranch;
    base: PullRequestBranch;
  }
}

interface PreviewRun {
  octokit: InstanceType<typeof GitHub>;
  core: typeof Core;
  payload: PullRequestPayload;
}

export function* run({ octokit, core, payload }: PreviewRun): Operation<void> {
  let { isValid, reason, payload: gitDiff, branch } = yield checkPrerequisites(payload);
  if (!isValid) {
    core.setFailed(reason);
  } else {
    let directoriesToPublish: Iterable<string> = yield findPackages(gitDiff);
    let installScript = core.getInput("INSTALL_SCRIPT") || "";
    let published: Iterable<string> = yield publish({ directoriesToPublish, installScript, branch });
    console.log('published:', published);
    // yield generateComment({ results, octokit })
  }
  console.log(octokit ? "whatever" : "whatever");
}
