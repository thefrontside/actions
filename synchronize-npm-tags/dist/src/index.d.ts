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
    preserve?: string[];
}
export interface PackageTags {
    name: string;
    tags: string[];
}
export declare function run({ octokit, payload, preserve }: ActionPayload): Operation<void>;
export {};
