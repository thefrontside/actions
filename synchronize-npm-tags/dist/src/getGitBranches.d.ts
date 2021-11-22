import { Operation } from "effection";
import { ActionPayload } from ".";
export declare function getGitBranches({ octokit, payload }: ActionPayload): Operation<void>;
