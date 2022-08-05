import { Operation } from "effection";
import { PullRequestPayload } from ".";

export type Prerequisites = {
  baseRef: string;
  branch: string;
}

export function* parsePayload(payload: PullRequestPayload): Operation<Prerequisites> {
  if (!payload.pull_request) {
    throw new Error("This action can only be run on pull requests");
  }

  let {
    head: {
      ref: headBranch,
      repo: {
        url: headUrl,
      },
    },
    base: {
      ref: baseRef,
      repo: {
        url: baseUrl,
      },
    },
  } = payload.pull_request;

  if (baseUrl !== headUrl) {
    throw new Error("This action cannot be run on pull requests created from a forked repository");
  } else if (headBranch === "latest") {
    throw new Error("Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name")
  }

  return { baseRef, branch: headBranch };
}
