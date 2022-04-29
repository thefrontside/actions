import { Operation } from "effection";
import { ActionPayload } from ".";
export declare function getGitBranches({ octokit, payload }: Omit<ActionPayload, "preserve">): Operation<void>;
