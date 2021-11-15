import { GitHub } from "@actions/github/lib/utils";
import { PullRequestPayload } from ".";
import { Operation } from "effection";
export declare function postGithubComment({ comment, octokit, payload, }: {
    comment: string;
    octokit: InstanceType<typeof GitHub>;
    payload: PullRequestPayload;
}): Operation<void>;
