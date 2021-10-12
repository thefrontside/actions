import { PreviewRun } from ".";
interface FindPackagesRun extends Omit<PreviewRun, 'octokit'> {
}
export declare function findPackages({ core, payload }: FindPackagesRun): Generator<any, string[], unknown>;
export {};
