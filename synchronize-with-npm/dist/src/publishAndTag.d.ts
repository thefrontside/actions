import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
import { PackageInfo } from "./listPackages";
import { GithubActionsPayload } from ".";
interface Publish {
    confirmedPkgsToPublish: PackageInfo[];
    installScript: string;
    octokit: InstanceType<typeof GitHub>;
    payload: GithubActionsPayload;
    dryRun: boolean;
}
export declare function publishAndTag({ confirmedPkgsToPublish, installScript, octokit, payload, dryRun, }: Publish): Operation<PackageInfo[]>;
export {};
