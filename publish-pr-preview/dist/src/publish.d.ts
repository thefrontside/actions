import { Operation } from "effection";
import { AttemptedPackage, LernaListOutputType } from "./types";
interface PublishRun {
    packages: LernaListOutputType;
    installScript: string;
    branch: string;
}
export interface PublishResults {
    tag: string;
    attemptedPackages: AttemptedPackage[];
}
export declare function publish({ packages, installScript, branch }: PublishRun): Operation<PublishResults>;
export {};
