import * as github from "@actions/github";
import { PullRequestPayload } from ".";

export function precheck(payload: PullRequestPayload) {
  if (!github.context.payload.pull_request) {
    throw new Error("This action can only be run on pull requests");
  } else {
    const {
      head: {
        ref: headBranch,
        repo: {
          url: headUrl
        }
      },
      base: {
        repo: {
          url: baseUrl
        }
      }
    } = payload.pull_request;
    if (baseUrl !== headUrl) {
      throw new Error("This action cannot be run on pull requests created from a forked repository");
    } else if (headBranch === "latest") {
      throw new Error("Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name");
    }
  }
}
