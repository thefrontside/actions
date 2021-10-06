import * as Core from "@actions/core/lib/core";
interface PreCheckRun {
    core: typeof Core;
}
export declare function precheck({ core }: PreCheckRun): void;
export {};
