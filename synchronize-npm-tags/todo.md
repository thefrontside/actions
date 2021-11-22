- [ ] suggest new name = `delete-stale-tags`
  - publish-preview, publish-release, synchronize-tags

- extract common utils to separate package
- removing tags
  - manually push tag
  - test removing tags
- on delete
  - get all non-private packages
  - get all git branches
    - *** `git ls-remote --heads origin` get x of refs/heads/x ***
    - push in list of default ignores and user input as branches
  - get all npm tags
    - *** `npm dist-tag ls` get everything before : ***
  - for each
    - convert to two variations (old action and new action)
    - check against branches
      - if no match = delete for every package
        - *** `npm dist-tag rm package-name tag-name` ***

- add colorful console logs
  "${GREEN}Keeping tag, ${YELLOW}$tag${GREEN}, because it is protected.${NC}"
  "${GREEN}Keeping tag, ${YELLOW}$tag${GREEN}, because we found a matching branch.${NC}"
  "${RED}Removed tag, ${YELLOW}$tag${RED} from NPM because it did not match any existing branches.${NC}"
- update readme
  - now supports monorepos
