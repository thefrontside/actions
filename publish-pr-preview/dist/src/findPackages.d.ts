import { PreviewRun } from ".";
interface FindPackagesRun extends Omit<PreviewRun, 'octokit' | 'core'> {
}
export declare function findPackages({ payload }: FindPackagesRun): Generator<any, string[], unknown>;
export {};
