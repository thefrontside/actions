import * as Core from "@actions/core/lib/core";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
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
    };
    repository: WebhookPayload["repository"] & {
        owner: {
            login: string;
        };
    };
}
interface PreviewRun {
    octokit: InstanceType<typeof GitHub>;
    core: typeof Core;
    payload: PullRequestPayload;
}
export declare function run({ octokit, core, payload }: PreviewRun): Operation<void>;
export {};
