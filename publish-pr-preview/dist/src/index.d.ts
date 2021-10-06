import { GitHub } from "@actions/github/lib/utils";
import * as Core from "@actions/core/lib/core";
interface PreviewRun {
    octokit: InstanceType<typeof GitHub>;
    core: typeof Core;
}
export declare function run({ octokit, core }: PreviewRun): Generator<never, void, unknown>;
export {};
