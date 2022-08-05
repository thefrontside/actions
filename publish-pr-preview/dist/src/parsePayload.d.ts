import { Operation } from "effection";
import { PullRequestPayload } from ".";
export declare type Prerequisites = {
    baseRef: string;
    branch: string;
};
export declare function parsePayload(payload: PullRequestPayload): Operation<Prerequisites>;
