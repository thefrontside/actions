import { GitHub } from "@actions/github/lib/utils";
import * as Core from "@actions/core/lib/core";
import { precheck } from "./precheck";

interface PreviewRun {
  octokit: InstanceType<typeof GitHub>;
  core: typeof Core;
}

export function* run({ octokit, core }: PreviewRun) {
  precheck({ core });
  console.log('dingdong')
}
