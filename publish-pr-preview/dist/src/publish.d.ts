import { Operation } from "effection";
interface PublishRun {
    directoriesToPublish: Iterable<string>;
    installScript: string;
}
export declare function publish({ directoriesToPublish, installScript }: PublishRun): Operation<string[]>;
export {};
