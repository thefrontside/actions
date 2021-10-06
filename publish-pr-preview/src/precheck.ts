import * as github from "@actions/github";
import * as Core from "@actions/core/lib/core";
import fs from "fs";

interface PreCheckRun {
  core: typeof Core;
}

export function precheck({ core }: PreCheckRun) {
  if (!github.context.payload.pull_request) {
    core.setFailed("This action can only be run on pull requests");
  } else {
    const {
      pull_request: {
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
      }
    } = JSON.parse(fs.readFileSync(`${process.env.GITHUB_EVENT_PATH}`, 'utf-8'));
    if (baseUrl !== headUrl) {
      core.setFailed("This action cannot be run on pull requests created from a forked repository");
    } else if (headBranch === "latest") {
      core.setFailed("Unable to proceed because \"latest\" is a protected NPM tag. Retrigger this action from a different branch name");
    }
  }
}