import { Operation } from "effection";
import { AttemptedPackage } from "./types";
interface PublishRun {
    baseRef: string;
    branch: string;
}
export interface PublishResults {
    tag: string;
    attemptedPackages: AttemptedPackage[];
}
export declare function publish({ branch, baseRef }: PublishRun): Operation<PublishResults>;
export {};
