import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { precheck } from "./precheck";
import { findPackages } from "./findPackages";

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

export function* run({ octokit, core, payload }: PreviewRun) {
  try {
    precheck(payload);

    const directoriesToPublish: Iterable<string> = yield findPackages(payload);
    console.log('directoriesToPublish:', directoriesToPublish);
    // const results = yield publish({ packagesToPublish });
      // skip private packages
    // yield generateComment({ results })
  } catch(err) {
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
}
