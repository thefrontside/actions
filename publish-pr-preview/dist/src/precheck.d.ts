import { PreviewRun } from ".";
interface PreCheckRun extends Omit<PreviewRun, 'octokit'> {
}
export declare function precheck({ core, payload }: PreCheckRun): void;
export {};
