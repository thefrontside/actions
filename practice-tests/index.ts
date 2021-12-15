import { Operation } from "effection";
import { PullRequestPayload, PreviewRun } from "../publish-pr-preview/src";

type CheckyResult = {
  isValid: boolean;
  reason: string;
}

function* checky(payload: PullRequestPayload): Operation<CheckyResult> {
  if (!payload.pull_request) {
    return {
      isValid: false,
      reason: "dingdong",
    }
  } else {
    return {
      isValid: true,
      reason: "",
    }
  }
}

export function* run({
  octokit,
  payload,
  core
}: PreviewRun): Operation<void> {
  // checkprerequisites
  if(octokit && payload && core) {
    let { isValid, reason } = yield checky(payload);
    if (!isValid) {
      core.setFailed(reason);
    }
  };
  // findpackages
  // installscript = core.getinput("install_script") || "";
  // publish
  // formatcomment
  // postgithubcomment
}
