import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
interface Run {
    octokit: InstanceType<typeof GitHub>;
}
export declare function run({ octokit }: Run): Operation<void>;
export {};
