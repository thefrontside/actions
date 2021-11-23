import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
export interface ActionPayload {
    octokit: InstanceType<typeof GitHub>;
}
export declare function run({ octokit }: ActionPayload): Operation<void>;
