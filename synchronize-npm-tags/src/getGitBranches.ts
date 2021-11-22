import { GetResponseTypeFromEndpointMethod as OctokitResponse } from "@octokit/types";
import { Operation } from "effection";
import { ActionPayload } from ".";

export function* getGitBranches({ octokit, payload }: ActionPayload): Operation<void> {
  let {
    repository: {
      name: repo,
      owner: {
        login: owner,
      },
    },
  } = payload;
  let result: OctokitResponse<typeof octokit.rest.repos.listBranches> = yield octokit.rest.repos.listBranches({
    owner,
    repo,
  });
  return result.data.map(data => data.name);
}
