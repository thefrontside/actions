import { exec, ProcessResult } from "@effection/process";
import { Operation } from "effection";
import { PullRequestPayload } from ".";

export type Prerequisites = {
  isValid: false;
  reason: string;
} | {
  isValid: true;
  payload: unknown;
  branch: string;
}

export function* checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites> {
  if (!payload.pull_request) {
    return { isValid: false, reason: "This action can only be run on pull requests" };
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
    return { isValid: false, reason: "This action cannot be run on pull requests created from a forked repository" };
  } else if (headBranch === "latest") {
    return { isValid: false, reason: "Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name" };
  }

  let affectedPackages: ProcessResult = yield exec(`npx lerna ls --since ${baseRef} --toposort --json`).join();
  if (affectedPackages.code === 0) {
    return { isValid: true, payload: JSON.parse(affectedPackages.stdout), branch: headBranch };
  } else {
    return { isValid: false, reason: affectedPackages.stderr };
  }
}
