import { WebhookPayload as DefaultPayload } from "@actions/github/lib/interfaces";
import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
// import { colors } from "@frontside/actions-utils";
import { findPublicPackages } from "./findPublicPackages";
import { getGitBranches } from "./getGitBranches";
import { getTagsForEachPackage } from "./getTagsForEachPackage";

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
  preserve?: string[];
}

export interface PackageTags {
  name: string,
  tags: string[]
}

export function* run ({ octokit, payload, preserve }: ActionPayload): Operation<void> {
  let publicPackages: string[] = findPublicPackages();
  let gitBranches: string[] = yield getGitBranches({ octokit, payload });
  console.log("publicPackages:", publicPackages);
  console.log("gitBranches:", gitBranches);
  console.log("preserve", preserve);
  let allPackageTags: PackageTags[] = yield getTagsForEachPackage({ publicPackages });
  console.log("npmTags", allPackageTags);
}

/*
- [ ] suggest new name = `delete-stale-tags`
  - publish-preview, publish-release, synchronize-tags

- for each
  - convert to two variations (old action and new action)
  - check against branches
    - if no match = delete for every package
      - *** `npm dist-tag rm package-name tag-name` ***
        // tag doesn't exist = code 1 = stderr includes "is not a dist-tag"
        // package doesn't exist = code 1 = stderr includes "403 and Forbidden"
        // no permission to package =  stderr includes "404 Not Found"

- add colorful console logs
  "${GREEN}Keeping tag, ${YELLOW}$tag${GREEN}, because it is protected.${NC}"
  "${GREEN}Keeping tag, ${YELLOW}$tag${GREEN}, because we found a matching branch.${NC}"
  "${RED}Removed tag, ${YELLOW}$tag${RED} from NPM because it did not match any existing branches.${NC}"
- update readme
  - now supports monorepos
*/
