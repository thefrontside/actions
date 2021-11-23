import { GitHub } from "@actions/github/lib/utils";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import * as Core from "@actions/core/lib/core";
import { Operation } from "effection";
export interface GithubActionsPayload extends WebhookPayload {
    repository: WebhookPayload["repository"] & {
        owner: {
            login: string;
        };
        name: string;
    };
}
export interface ActionPayload {
    octokit: InstanceType<typeof GitHub>;
    core: typeof Core;
    payload: GithubActionsPayload;
}
export declare function run({ octokit, core, payload }: ActionPayload): Operation<void>;
