import { Operation } from "effection";
import fs from "fs";

interface PublishRun {
  directoriesToPublish: Iterable<string>;
  installScript: string;
  branch: string
}

export function* publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<string[]> {
  // detect for workspace to compare with directoresToPublish to see which one to install separately
    // ❌ bad idea; we don't know what kind of setup users will have in their monorepo
  // setup npmrc? - may or may not be necessary
    // this should happen before install as projects might have private dependencies
  let install = installScript || fs.existsSync('yarn.lock') ? 'yarn install --frozen-lockfile' : 'npm ci';
  console.log('branch', branch);  
    // get tag from branch and parse
    // for each directory, get its package json
    //   skip if private
    //   get latest version
    //     patch bump
    //       check with pre-release tag to see if any previous previews
    //         if so capture interval
    //       pre-release tag with branch and new interval
    //       npm version x --no-git-tag-version
    //       npm publish --access=public --tag tag
    //   if successful publish, add package name and version to array for comment
    // return array
  console.log(directoriesToPublish ? "whatever" : install);
  return [''];
}
