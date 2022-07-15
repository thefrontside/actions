import { Operation } from "effection";
import { PullRequestPayload } from ".";
export declare type Prerequisites = {
    isValid: false;
    reason: string;
} | {
    isValid: true;
    baseRef: string;
    branch: string;
};
export declare function checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites>;
