import { Operation } from "effection";
import { PullRequestPayload } from ".";
declare type Prerequisites = {
    isValid: false;
    reason: string;
} | {
    isValid: true;
    payload: string[];
};
export declare function checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites>;
export {};
