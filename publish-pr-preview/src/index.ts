import { GitHub } from "@actions/github/lib/utils";

interface PreviewRun {
  octokit: InstanceType<typeof GitHub>;
}

export function* run({ octokit }: PreviewRun) {
  console.log('hello', octokit);
}
