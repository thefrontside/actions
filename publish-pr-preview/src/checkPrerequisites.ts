import * as github from "@actions/github";
import { exec, Process } from "@effection/process";
import { Operation } from "effection";
import { PullRequestPayload } from ".";

type Prerequisites = {
  isValid: false;
  reason: string;
} | {
  isValid: true;
  payload: string[];
}

export function* checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites> {
  let {
    head: {
      ref: headBranch,
      repo: {
        url: headUrl
      },
      sha: headSHA
    },
    base: {
      repo: {
        url: baseUrl
      },
      sha: baseSHA
    }
  } = payload.pull_request;
  let pull_request = !!github.context.payload.pull_request;
  let forked_repo = baseUrl !== headUrl;
  let prohibited_branch = headBranch === "latest";

  if (!pull_request) {
    return { isValid: false, reason: "This action can only be run on pull requests" };
  } else if (forked_repo) {
    return { isValid: false, reason: "This action cannot be run on pull requests created from a forked repository" };
  } else if (prohibited_branch) {
    return { isValid: false, reason: "Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name" };
  }

  // 🚨 test this in github actions workflow
  let npmAuthenticated: Process = yield exec(`npm whoami`);
  let { code: npmAuthenticatedExitCode } = yield npmAuthenticated.join();
  if (npmAuthenticatedExitCode !== 1) {
    return { isValid: false, reason: "Not authenticated to publish. Configure the setup-node action in your workflow with the correct settings." };
  }

  let gitDiff: Process = yield exec(`git diff --quiet ${baseSHA}...${headSHA}`);
  let buffer: string[] = yield gitDiff.stdout.lines().toArray();
  let { code: gitDiffExitCode } = yield gitDiff.join();
  if (gitDiffExitCode !== 1) {
    return { isValid: false, reason: "The base commit could not be found. Configure the checkout action in your workflow with the correct settings." };
  } else {
    return { isValid: true, payload: buffer };
  }
}
