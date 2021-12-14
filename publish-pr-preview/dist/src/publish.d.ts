import { Operation } from "effection";
interface PublishRun {
    directoriesToPublish: string[];
    installScript: string;
    branch: string;
}
export interface PublishedPackages {
    packageName: string;
    version: string;
}
export interface FailedPublish {
    packageName: string;
    versions: string[];
}
export interface PublishResults {
    tag: string;
    publishedPackages: PublishedPackages[];
    unsuccessfulPublishes: FailedPublish[];
}
export declare function publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<PublishResults>;
export {};
