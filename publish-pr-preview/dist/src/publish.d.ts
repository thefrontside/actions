import { Operation } from "effection";
interface PublishRun {
    directoriesToPublish: Iterable<string>;
    installScript: string;
    branch: string;
}
export declare function publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<string[]>;
export {};
