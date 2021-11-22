import { WebhookPayload as DefaultPayload } from "@actions/github/lib/interfaces";
import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
import { findPublicPackages } from "./findPublicPackages";
import { getGitBranches } from "./getGitBranches";
import { getTagsForEachPackage } from "./getTagsForEachPackage";
import { removeTags } from "./removeTags";

interface WebhookPayload extends DefaultPayload {
  repository: DefaultPayload["repository"] & {
    name: string,
    owner: {
      login: string
    }
  }
}

export interface ActionPayload {
  octokit: InstanceType<typeof GitHub>;
  payload: WebhookPayload;
  preserve: string[];
}

export interface PackageTags {
  name: string,
  tags: string[]
}

export function* run ({ octokit, payload, preserve }: ActionPayload): Operation<void> {
  let publicPackages: string[] = findPublicPackages();
  let gitBranches: string[] = yield getGitBranches({ octokit, payload });
  let allPackageTags: PackageTags[] = yield getTagsForEachPackage({ publicPackages });
  yield removeTags({ allPackageTags, gitBranches, preserve });
}

/*
- [ ] suggest new name = `delete-stale-tags` in separate issue
  - publish-preview, publish-release, synchronize-tags
- update readme
  - now supports monorepos
  - is backwards compatible with branch string treatments
  - make it manually triggerable
*/
