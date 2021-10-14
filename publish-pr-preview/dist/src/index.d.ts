import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
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
}
interface PreviewRun {
    octokit: InstanceType<typeof GitHub>;
    core: typeof Core;
    payload: PullRequestPayload;
}
export declare function run({ octokit, core, payload }: PreviewRun): Generator<Generator<any, Iterable<string>, any>, void, Iterable<string>>;
export {};
