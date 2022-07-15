import { Operation } from "effection";
import { AttemptedPackage } from "./types";
interface PublishRun {
    installScript: string;
    baseRef: string;
    branch: string;
}
export interface PublishResults {
    tag: string;
    attemptedPackages: AttemptedPackage[];
}
export declare function publish({ installScript, branch, baseRef }: PublishRun): Operation<PublishResults>;
export {};
