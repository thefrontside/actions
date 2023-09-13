import { GitHub } from "@actions/github/lib/utils";
import { exec, ProcessResult } from "@effection/process";
import { install } from "@frontside/actions-utils";
import { Operation } from "effection";
import { PackageInfo } from "./listPackages";
import { GithubActionsPayload } from ".";

interface Publish {
  confirmedPkgsToPublish: PackageInfo[];
  installScript: string;
  octokit: InstanceType<typeof GitHub>;
  payload: GithubActionsPayload;
  dryRun: boolean;
  useYarn: boolean;
}

export function* publishAndTag({
  confirmedPkgsToPublish,
  installScript,
  octokit,
  payload,
  dryRun,
  useYarn,
}: Publish): Operation<PackageInfo[]> {
  if (confirmedPkgsToPublish.length) {

    yield install({ installScript });

    let successfullyPublished: PackageInfo[] = [];
    for (let pkg of confirmedPkgsToPublish) {
      let cmd = `${useYarn ? "yarn " : ""}npm publish --access=public ${dryRun ? "--dry-run" : ""}`;
      console.log(`::group::${pkg.path} $ ${cmd}`);
      let result: ProcessResult = yield exec(cmd, { cwd: pkg.path }).join();
      // TODO how can i turn octokit.request into an operation so i can .join()
      console.log(result.stdout);
      if (!dryRun && result.code === 0) {
        yield octokit.request("POST /repos/{owner}/{repo}/git/refs", {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          ref: `refs/tags/${pkg.name}-v${pkg.version}`,
          sha: payload.after,
        });
        successfullyPublished = [...successfullyPublished, pkg];
      } else {
        console.log(`::warning::${result.stderr}`);
      }
      console.log("::endgroup::");
    }
    return successfullyPublished;
  } else {
    return [] as PackageInfo[];
  }
}
