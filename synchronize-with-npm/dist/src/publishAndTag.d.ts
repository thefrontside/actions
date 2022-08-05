import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
import { ToPublish } from "./listPackages";
import { GithubActionsPayload } from ".";
interface Publish {
    confirmedPkgsToPublish: ToPublish[];
    octokit: InstanceType<typeof GitHub>;
    payload: GithubActionsPayload;
}
export declare function publishAndTag({ confirmedPkgsToPublish, octokit, payload, }: Publish): Operation<ToPublish[]>;
export {};
