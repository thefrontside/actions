import { GetResponseTypeFromEndpointMethod as OctokitResponse } from "@octokit/types";
import { Operation } from "effection";
import { ActionPayload } from ".";
import { colors } from "@frontside/actions-utils";

export function* getGitBranches({ octokit, payload }: Omit<ActionPayload, "preserve">): Operation<void> {
  let {
    repository: {
      name: repo,
      owner: {
        login: owner,
      },
    },
  } = payload;

  console.log(colors.yellow("Retrieving branches of this repository...\n"));
  let result: OctokitResponse<typeof octokit.rest.repos.listBranches> = yield octokit.rest.repos.listBranches({
    owner,
    repo,
  });

  return result.data.map(data => data.name);
}
