import { GitHub } from "@actions/github/lib/utils";
import { exec, ProcessResult } from "@effection/process";
import { colors } from "@frontside/actions-utils";
import { all, Operation } from "effection";
import fs from "fs";
import { ToPublish } from "./listPackages";
import { GithubActionsPayload } from ".";

interface Publish {
  confirmedPkgsToPublish: ToPublish[];
  installScript: string;
  octokit: InstanceType<typeof GitHub>;
  payload: GithubActionsPayload;
}

export function* publishAndTag({
  confirmedPkgsToPublish,
  installScript,
  octokit,
  payload,
}: Publish): Operation<ToPublish[]> {
  if (confirmedPkgsToPublish.length) {
    let installCommand = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";

    console.log(
      colors.yellow("Installing with command"),
      colors.blue(installCommand)+colors.yellow("...\n"),
    );
    yield exec(installCommand).join();

    let successfullyPublished: ToPublish[] = [];
    yield all(
      confirmedPkgsToPublish.map(pkg =>
        function* () {
          let result: ProcessResult = yield exec("npm publish --access=public", { cwd: pkg.path }).join();
          // TODO how can i turn octokit.request into an operation so i can .join()
          if (result.code === 0) {
            yield octokit.request("POST /repos/{owner}/{repo}/git/refs", {
              owner: payload.repository.owner.login,
              repo: payload.repository.name,
              ref: `refs/tags/${pkg.name}-v${pkg.version}`,
              sha: payload.after,
            });
            successfullyPublished = [...successfullyPublished, pkg];
          } else {
            console.warn(`FAILED: publish ${pkg.name}
command: npm publish --access=public
cwd: ${pkg.path}
code: ${result.code}
signal: ${result.signal}
<stdout>
${result.stdout}
</stdout>
<stderr>
${result.stderr}
</stderr>`);
          }
        }
      )
    );

    return successfullyPublished;
  } else {
    return [] as ToPublish[];
  }
}
