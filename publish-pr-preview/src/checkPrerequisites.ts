import * as github from "@actions/github";
import { exec, Process } from "@effection/process";
import { Operation } from "effection";
import { PullRequestPayload } from ".";

type Prerequisites = {
  [key: string]: boolean
}

export function* checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites> {
  let {
    head: {
      ref: headBranch,
      repo: {
        url: headUrl
      }
    },
    base: {
      repo: {
        url: baseUrl
      },
      sha: baseSHA
    }
  } = payload.pull_request;

  // try {
  //   let confirmCommitFetch: Process = yield exec(`git show ${baseSHA}`);
  //   yield confirmCommitFetch.expect();
  // } catch {
  //   throw new Error("The base commit could not be found. Configure the checkout action in your workflow with the correct settings.");
  // }
  // try {
  //   let confirmCommitFetch: Process = yield exec(`npm whoami`);
  //   yield confirmCommitFetch.expect();
  // } catch {
  //   throw new Error("Not authenticated to publish. Configure the setup-node action in your workflow with the correct settings.");
  // }

  return {
    pull_request: !!github.context.payload.pull_request,
    forked_repo: baseUrl !== headUrl,
    prohibited_branch: headBranch === "latest",
    checkout_action: true,
    setup_node_action: true
  };
}
