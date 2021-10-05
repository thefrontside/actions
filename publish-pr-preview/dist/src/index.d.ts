import { GitHub } from "@actions/github/lib/utils";
interface PreviewRun {
    octokit: InstanceType<typeof GitHub>;
}
export declare function run({ octokit }: PreviewRun): Generator<never, void, unknown>;
export {};
