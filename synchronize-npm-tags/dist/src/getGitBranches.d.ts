import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
interface GetBranches {
    octokit: InstanceType<typeof GitHub>;
}
export declare function getGitBranches({ octokit }: GetBranches): Operation<void>;
export {};
