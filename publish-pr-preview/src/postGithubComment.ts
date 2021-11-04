import { GitHub } from "@actions/github/lib/utils";
import { PullRequestPayload } from ".";
import { Operation } from "effection";
import colors from "./ansiColors";

export function* postGithubComment({
  comment,
  octokit,
  payload,
}:{
  comment: string,
  octokit: InstanceType<typeof GitHub>,
  payload: PullRequestPayload,
}): Operation<void> {
  let {
    repository: {
      name: repo,
      owner: {
        login: owner,
      },
    },
    pull_request: {
      number: issue_number,
    },
  } = payload;
  let tag = "<!-- Published Preview Action by Frontside -->";
  let body = comment+tag;
  let allComments = yield octokit.rest.issues.listComments({ owner, repo, issue_number });
  let previousComment = allComments.data.length > 0 &&
    allComments.data.find((comment: { body: string | string[]; }) => comment.body.includes(tag));

  if (previousComment) {
    console.log("\n"+colors.yellow("Updating comment in pull request..."));
    yield octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: previousComment.id,
      body,
    });
  } else {
    console.log("\n"+colors.yellow("Posting comment in pull request..."));
    yield octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });
  }
}
