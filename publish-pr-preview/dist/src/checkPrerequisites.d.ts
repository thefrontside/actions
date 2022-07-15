import { Operation } from "effection";
import { PullRequestPayload } from ".";
export declare type Prerequisites = {
    isValid: false;
    reason: string;
} | {
    isValid: true;
    payload: unknown;
    branch: string;
};
export declare function checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites>;
