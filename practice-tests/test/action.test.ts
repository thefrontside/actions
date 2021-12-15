import { GitHub } from "@actions/github/lib/utils";
import { PullRequestPayload } from "../../publish-pr-preview/src";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { describe, it, beforeEach, captureError } from "@effection/mocha";
import { spawn } from "effection";
import expect from "expect";
import { run } from "..";

describe("testing action", () => {
  let payload: PullRequestPayload;
  let octokit: InstanceType<typeof GitHub>;
  beforeEach(function* () {
    process.env = {
      GITHUB_TOKEN: 'abcdefg',
    };
    payload = {
      repository: {
        name: "repo_name",
        owner: {
          login: "user_name"
        }
      },
      // pull_request: {
      //   number: 123,
      //   head: {
      //     ref: "feature-branch",
      //     repo: {
      //       url: "github.com/primary"
      //     },
      //     sha: "222222"
      //   },
      //   base: {
      //     ref: "main",
      //     repo: {
      //       url: "github.com/primary"
      //     },
      //     sha: "111111"
      //   }
      // }
    };
    const token = process.env.GITHUB_TOKEN || "";
    octokit = github.getOctokit(token);
  });
  it("doodoo", function* () {
    const result = yield spawn(function* () {
      return run({ octokit, payload, core })
    });
    expect(result).toBe(true);
  });
});
