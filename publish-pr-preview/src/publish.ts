import { Operation } from "effection";
import fs from "fs";

interface PublishRun {
  directoriesToPublish: string[];
  installScript: string;
  branch: string
}

export function* publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<string[]> {
  // detect for workspace to compare with directoresToPublish to see which one to install separately
    // ❌ bad idea; we don't know what kind of setup users will have in their monorepo
  // setup npmrc? - may or may not be necessary
    // this should happen before install as projects might have private dependencies
  let install = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";
  console.log("branch", branch);
  let tag = branch.replace(/(?!.\_)\_/g, "__").replace(/\//g, "_");

  directoriesToPublish.forEach(directory => {
    let { name, version, private: privatePackage } = JSON.parse(
      fs.readFileSync(`${directory}/package.json`, { encoding: "utf-8" })
    );
    if(!privatePackage) {
      console.log("should publish preview for:", name, version);
      // get latest minor version of the current package version
        // calculate using npm view package version --json
          // semver package?
        // check package@tag to see if the last preview was published on the latest minor version (plus patch)
          // calculate interval
          // ? what happens if we try to publish same version twice
            // attempt another interval bump if it fails
        // apply new preview version
          // npm version x --no-git-tag-version
          // npm publish --access=public --tag tag
        // if successful publish, add package name and version to array for comment
    }
  });
  // return array

  console.log(directoriesToPublish, install, tag);
  return [""];
}
