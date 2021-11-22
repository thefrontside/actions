import { GitHub } from "@actions/github/lib/utils";
import { Operation } from "effection";
// import { colors } from "@frontside/actions-utils";
import { findPublicPackages } from "./findPublicPackages";

interface Run {
  octokit: InstanceType<typeof GitHub>;
}

export function* run ({ octokit }: Run): Operation<void> {
  console.log("doodoo");
  let publicPackages: string[] = findPublicPackages();
  console.log(publicPackages);
}

/*
- [ ] suggest new name = `delete-stale-tags`
  - publish-preview, publish-release, synchronize-tags

  - get all git branches
    - *** `git ls-remote --heads origin` get x of refs/heads/x ***
    - push in list of default ignores and user input as branches
  - get all npm tags for each package
    - *** `npm dist-tag ls` get everything before : ***
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
