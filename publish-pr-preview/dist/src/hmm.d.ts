import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
export interface PullRequestBranch {
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
    };
}
export interface PreviewRun {
    octokit?: InstanceType<typeof GitHub>;
    core: typeof Core;
    payload: PullRequestPayload;
}
export declare type PreviewPackages = string[];
