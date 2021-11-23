import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";

export interface ActionPayload {
  octokit: InstanceType<typeof GitHub>;
}

export function* run({ octokit }: ActionPayload): Operation<void> {
  console.log("doodoo", octokit);
}

/*
findAllPackages, omit private packages, omit package.json at the end
npm view to see if it needs to be published

yarn or script
publish

deprecate?
npm deprecate pkg-name description
*/
