import * as Core from "@actions/core/lib/core";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import { GitHub } from "@actions/github/lib/utils";
import { detectAffectedPackages, install, LernaListOutputType } from "@frontside/actions-utils";
import { Operation } from "effection";
import { parsePayload, Prerequisites } from "./parsePayload";
import { formatComment } from "./formatComment";
import { postGithubComment } from "./postGithubComment";
import { publish, PublishResults } from "./publish";

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
  repository: WebhookPayload["repository"] & {
    owner: {
      login: string;
    }
  }
}

interface PreviewRun {
  octokit: InstanceType<typeof GitHub>;
  core: typeof Core;
  payload: PullRequestPayload;
}

export function* run({ octokit, core, payload }: PreviewRun): Operation<void> {
  let req: Prerequisites;
  try {
    req = yield parsePayload(payload);
  } catch (e) {
    core.setFailed(`${e}`);
    return;
  }

  yield install({ installScript: core.getInput("INSTALL_SCRIPT") || "" });

  let packages: LernaListOutputType = yield detectAffectedPackages({ baseRef: req.baseRef });

  let results: PublishResults = yield publish({ branch: req.branch, packages });
  let comment: string = formatComment({ results });

  yield postGithubComment({ comment, octokit, payload });
}
