import { PullRequestPayload } from ".";
declare type Prerequisites = {
    [key: string]: boolean;
};
export declare function precheck(payload: PullRequestPayload): Prerequisites;
export {};
