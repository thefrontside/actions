import { LernaListOutputType } from "@frontside/actions-utils";
import { Operation } from "effection";
import { AttemptedPackage } from "./types";
interface PublishRun {
    packages: LernaListOutputType;
    branch: string;
}
export interface PublishResults {
    tag: string;
    attemptedPackages: AttemptedPackage[];
}
export declare function publish({ branch, packages }: PublishRun): Operation<PublishResults>;
export {};
