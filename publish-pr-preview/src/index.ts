import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { precheck } from "./precheck";
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

export function* run({ octokit, core, payload }: PreviewRun) {
  try {
    let { pull_request, forked_repo, prohibited_branch } = precheck(payload);
    if (!pull_request) {
      throw new Error("This action can only be run on pull requests");
    } else if (forked_repo) {
      throw new Error("This action cannot be run on pull requests created from a forked repository");
    } else if (prohibited_branch) {
      throw new Error("Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name");
    } else {
      const directoriesToPublish: Iterable<string> = yield findPackages(payload);
      console.log('directoriesToPublish:', directoriesToPublish);
      const results: Iterable<string> = yield publish(directoriesToPublish);
      console.log('results from publish:', results);
      // yield generateComment({ results, octokit })
    }
  } catch(err) {
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
}
