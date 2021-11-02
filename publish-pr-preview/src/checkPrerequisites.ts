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
  branch: string;
}

export function* checkPrerequisites(payload: PullRequestPayload): Operation<Prerequisites> {
  let {
    head: {
      ref: headBranch,
      repo: {
        url: headUrl,
      },
      sha: headSHA,
    },
    base: {
      repo: {
        url: baseUrl,
      },
      sha: baseSHA,
    },
  } = payload.pull_request;

  if (!github.context.payload.pull_request) {
    return { isValid: false, reason: "This action can only be run on pull requests" };
  } else if (baseUrl !== headUrl) {
    return { isValid: false, reason: "This action cannot be run on pull requests created from a forked repository" };
  } else if (headBranch === "latest") {
    return { isValid: false, reason: "Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name" };
  }

  let gitDiff: Process = yield exec(`git diff ${baseSHA}...${headSHA} --name-only`);
  let buffer: string[] = yield gitDiff.stdout.lines().toArray();
  let { code: gitDiffExitCode } = yield gitDiff.join();
  if (gitDiffExitCode !== 0) {
    return { isValid: false, reason: "The base commit could not be found. Configure the checkout action in your workflow with the correct settings." };
  } else {
    return { isValid: true, payload: buffer, branch: headBranch };
  }
}
