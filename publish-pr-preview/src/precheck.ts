import * as github from "@actions/github";
import { PreviewRun } from '.';

interface PreCheckRun extends Omit<PreviewRun, 'octokit'> {};

export function precheck({ core, payload }: PreCheckRun) {
  if (!github.context.payload.pull_request) {
    core.setFailed("This action can only be run on pull requests");
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
      },
    } = payload?.pull_request;
    if (baseUrl !== headUrl) {
      core.setFailed("This action cannot be run on pull requests created from a forked repository");
    } else if (headBranch === "latest") {
      core.setFailed("Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name");
    }
  }
}