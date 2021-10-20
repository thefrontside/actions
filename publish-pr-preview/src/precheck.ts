import * as github from "@actions/github";
import { PullRequestPayload } from ".";

type Prerequisites = {
  [key: string]: boolean
}

export function precheck(payload: PullRequestPayload): Prerequisites {
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

  return {
    pull_request: !!github.context.payload.pull_request,
    forked_repo: baseUrl !== headUrl,
    prohibited_branch: headBranch === "latest"
  }
}
