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
export interface PublishResults {
    publishedPackages: PublishedPackages[];
    tag: string;
}
export declare function publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<PublishResults>;
export {};
