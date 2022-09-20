import { GitHub } from "@actions/github/lib/utils";
import { exec, ProcessResult } from "@effection/process";
import { all, Operation } from "effection";
import { ToPublish } from "./listPackages";
import { GithubActionsPayload } from ".";

interface Publish {
  confirmedPkgsToPublish: ToPublish[];
  octokit: InstanceType<typeof GitHub>;
  payload: GithubActionsPayload;
  publishScript: string;
}

export function* publishAndTag({
  confirmedPkgsToPublish,
  octokit,
  payload,
  publishScript,
}: Publish): Operation<ToPublish[]> {
  if (confirmedPkgsToPublish.length) {
    let successfullyPublished: ToPublish[] = [];
    yield all(
      confirmedPkgsToPublish.map(pkg =>
        function* () {
          let result: ProcessResult = yield exec(publishScript, { cwd: pkg.path }).join();
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
command: ${publishScript}
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
