import { WebhookPayload as DefaultPayload } from "@actions/github/lib/interfaces";
import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
interface WebhookPayload extends DefaultPayload {
    repository: DefaultPayload["repository"] & {
        name: string;
        owner: {
            login: string;
        };
    };
}
export interface ActionPayload {
    octokit: InstanceType<typeof GitHub>;
    payload: WebhookPayload;
}
export declare function run({ octokit, payload }: ActionPayload): Operation<void>;
export {};
