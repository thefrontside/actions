import { GitHub } from "@actions/github/lib/utils";
import { exec, Process, ProcessResult } from "@effection/process";
import { colors } from "@frontside/actions-utils";
import { spawn, Operation } from "effection";
import fs from "fs";
import { PackageInfo } from "./listPackages";
import { GithubActionsPayload } from ".";

interface Publish {
  confirmedPkgsToPublish: PackageInfo[];
  installScript: string;
  octokit: InstanceType<typeof GitHub>;
  payload: GithubActionsPayload;
  dryRun: boolean;
}

export function* publishAndTag({
  confirmedPkgsToPublish,
  installScript,
  octokit,
  payload,
  dryRun,
}: Publish): Operation<PackageInfo[]> {
  if (confirmedPkgsToPublish.length) {

    let installCommand = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";

    console.log(
      "::group::",
      colors.yellow("Installing with command"),
      colors.blue(installCommand)+colors.yellow("...\n"),
    );
    let install: Process = yield exec(installCommand);
    yield spawn(install.stdout.forEach(chars => { process.stdout.write(chars) }));
    yield spawn(install.stderr.forEach(chars => { process.stderr.write(chars) }));
    yield install.expect();
    console.log("::endgroup::");

    let successfullyPublished: PackageInfo[] = [];
    for (let pkg of confirmedPkgsToPublish) {
      let cmd = `npm publish --access=public ${dryRun ? "--dry-run" : ""}`;
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
