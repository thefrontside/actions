import { Operation } from "effection";
interface PublishRun {
    directoriesToPublish: string[];
    installScript: string;
    branch: string;
}
export declare function publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<string[]>;
export {};
