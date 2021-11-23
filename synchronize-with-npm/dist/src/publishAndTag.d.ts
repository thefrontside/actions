import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
import { ToPublish } from "./listPackages";
import { GithubActionsPayload } from ".";
interface Publish {
    confirmedPkgsToPublish: ToPublish[];
    installScript: string;
    octokit: InstanceType<typeof GitHub>;
    payload: GithubActionsPayload;
}
export declare function publishAndTag({ confirmedPkgsToPublish, installScript, octokit, payload, }: Publish): Operation<string[]>;
export {};
